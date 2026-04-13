import io
import re
import tempfile
from decimal import Decimal, InvalidOperation
from difflib import SequenceMatcher

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from rest_framework import serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiRequest, OpenApiResponse, extend_schema


# Serializer for PDF upload documentation
class ReceiptPdfUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


from backend_api.models import Receipt, Item

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None

try:
    import pytesseract
except ImportError:  # pragma: no cover
    pytesseract = None

try:
    from pdf2image import convert_from_bytes
except ImportError:  # pragma: no cover
    convert_from_bytes = None


PRICE_RE = re.compile(r"(\d+[,.]\d{2})\s*(?:PLN|ZL|zł)?$", re.IGNORECASE)
PRICE_ONLY_RE = re.compile(r"^\d+[,.]\d{2}$")
DATE_RE = re.compile(r"\b(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})\b")
TAX_SUMMARY_LINE_RE = re.compile(
    r"^[A-Z]\s+\d{1,2}%\s+(?:\d+[,.]\d{2}\s+){1,3}\d+[,.]\d{2}$"
)
PAGE_FOOTER_RE = re.compile(r"^Strona\s+\d+\s+z\s+\d+$", re.IGNORECASE)
NEGATIVE_PRICE_RE = re.compile(r"-\d+[,.]\d{2}")
BIEDRONKA_QUANTITY_RE = re.compile(r"(\d+[,.]\d{3})\s*[x×*]")
BIEDRONKA_PRODUCT_LINE_RE = re.compile(
    r"^(?P<name>.+?)\s+(?P<ptu>[A-Za-z]{1,2})\s+(?P<qty>\d+[,.]\d{3})\s*[x×*]\s*"
    r"(?P<unit>\d+[,.]\d{2})(?:\s+(?P<value>\d+[,.]\d{2}))?$"
)
IGNORE_LINE_RE = re.compile(
    r"^(og[oó]łem|razem|suma|suma pln|sprzeda[żz]|podatek|vat|rabat|saldo|reszta|"
    r"podsumowanie zakup[oó]w|numer klienta|godzina|data:?)$",
    re.IGNORECASE,
)
GENERIC_QTY_INLINE_RE = re.compile(
    r"\s+(?P<ptu>[A-Za-z]{1,2})\s+(?P<qty>\d+[,.]\d{3})\s*[x×*]\s+(?P<unit>\d+[,.]\d{2})$"
)

OCR_NOT_AVAILABLE_WARNING = (
    "Nie udało się odczytać tekstu z PDF. Ten plik prawdopodobnie zawiera obraz. "
    "Dla takich paragonów doinstaluj OCR: pytesseract, pdf2image oraz systemowo tesseract i poppler."
)


class ReceiptPdfParser:
    @classmethod
    def parse(cls, uploaded_file):
        text = cls._extract_pdf_text(uploaded_file)
        warning = None

        if not text.strip():
            text = cls._extract_text_with_ocr(uploaded_file)
            if text.strip():
                warning = "Użyto OCR, bo PDF nie zawierał warstwy tekstowej."
            else:
                return {
                    "shop": "",
                    "payment_date": None,
                    "items": [],
                    "raw_text": "",
                    "warning": OCR_NOT_AVAILABLE_WARNING,
                }

        shop = cls._extract_shop(text)

        return {
            "shop": shop,
            "payment_date": cls._extract_date(text),
            "items": cls._extract_items(text, shop=shop),
            "raw_text": text,
            "warning": warning,
        }

    @staticmethod
    def _extract_text_with_ocr(uploaded_file):
        if pytesseract is None or convert_from_bytes is None:
            return ""

        uploaded_file.seek(0)
        pdf_bytes = uploaded_file.read()
        uploaded_file.seek(0)

        if not pdf_bytes:
            return ""

        with tempfile.TemporaryDirectory() as temp_dir:
            images = convert_from_bytes(pdf_bytes, dpi=250, output_folder=temp_dir)
            extracted_pages = []
            for image in images:
                processed_image = image.convert("L")
                extracted_pages.append(
                    pytesseract.image_to_string(
                        processed_image,
                        lang="pol+eng",
                        config="--oem 3 --psm 6",
                    )
                )

        return "\n".join(extracted_pages)

    @staticmethod
    def _extract_pdf_text(uploaded_file):
        if PdfReader is None:
            raise RuntimeError("Brakuje zależności pypdf. Dodaj ją do backendu.")

        uploaded_file.seek(0)
        buffer = io.BytesIO(uploaded_file.read())
        uploaded_file.seek(0)

        reader = PdfReader(buffer)
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return "\n".join(pages)

    @staticmethod
    def _extract_shop(text):
        lines = [line.strip() for line in text.splitlines() if line.strip()]

        preferred_patterns = [
            ("kaufland", re.compile(r"\bkaufland\b", re.IGNORECASE)),
            ("biedronka", re.compile(r"\bbiedronka\b", re.IGNORECASE)),
            ("lidl", re.compile(r"\blidl\b", re.IGNORECASE)),
            ("żabka", re.compile(r"\bżabka\b|\bzabka\b", re.IGNORECASE)),
            ("netto", re.compile(r"\bnetto\b", re.IGNORECASE)),
            ("rossmann", re.compile(r"\brossmann\b", re.IGNORECASE)),
        ]

        for line in lines[:15]:
            for _, pattern in preferred_patterns:
                if pattern.search(line):
                    return line

        for line in lines[:15]:
            normalized_alpha = re.sub(r"[^a-ząćęłńóśźż]", "", line.lower())
            if not normalized_alpha:
                continue

            for store_name, _ in preferred_patterns:
                similarity = SequenceMatcher(None, normalized_alpha, store_name).ratio()
                if similarity >= 0.65 or store_name in normalized_alpha:
                    return line

        for line in lines[:10]:
            normalized_line = line.lower()
            if (
                len(line) > 2
                and not DATE_RE.search(line)
                and not any(char.isdigit() for char in normalized_line[:8])
            ):
                return line
        return ""

    @staticmethod
    def _extract_date(text):
        match = DATE_RE.search(text)
        if not match:
            return None

        raw = match.group(1).replace("/", "-").replace(".", "-")
        if re.match(r"^\d{4}-\d{2}-\d{2}$", raw):
            return raw

        day, month, year = raw.split("-")
        return f"{year}-{month}-{day}"

    @classmethod
    def _extract_items(cls, text, shop=""):
        store_type = cls._detect_store_type(shop, text)

        if store_type == "kaufland":
            items = cls._extract_items_kaufland(text)
            if items:
                return items

        if store_type == "biedronka":
            items = cls._extract_items_biedronka(text)
            if items:
                return items

        return cls._extract_items_generic(text)

    @classmethod
    def _detect_store_type(cls, shop, text):
        haystack = " ".join([shop or "", text[:500]]).lower()
        normalized = re.sub(r"[^a-ząćęłńóśźż]", "", haystack)

        if "kaufland" in normalized:
            return "kaufland"
        if "biedronka" in normalized:
            return "biedronka"

        if SequenceMatcher(None, normalized[:40], "biedronka").ratio() >= 0.55:
            return "biedronka"

        for line in text.splitlines()[:15]:
            line_normalized = re.sub(r"[^a-ząćęłńóśźż]", "", line.lower())
            if not line_normalized:
                continue
            if SequenceMatcher(None, line_normalized, "biedronka").ratio() >= 0.65:
                return "biedronka"
            if SequenceMatcher(None, line_normalized, "kaufland").ratio() >= 0.70:
                return "kaufland"

        return ""

    @classmethod
    def _extract_items_kaufland(cls, text):
        lines = cls._normalize_lines(text)
        if not lines:
            return []

        items = []
        in_items_section = False

        for line in lines:
            normalized_line = line.lower()

            if "cena pln" in normalized_line:
                in_items_section = True
                continue

            if not in_items_section:
                continue

            if "ogółem" in normalized_line or "ogolem" in normalized_line:
                break

            if TAX_SUMMARY_LINE_RE.match(line):
                continue

            if cls._is_summary_or_payment_line(line):
                continue

            if DATE_RE.search(line):
                continue

            price_match = PRICE_RE.search(line)
            if not price_match:
                continue

            description = line[: price_match.start()].strip(" -:;")
            description = re.sub(r"\s{2,}", " ", description)
            if not description or len(description) < 3:
                continue

            if any(
                phrase in normalized_line
                for phrase in [
                    "podsumowanie zakupów",
                    "numer klienta",
                    "za ten zakup",
                    "podatek",
                    "brutto",
                    "netto",
                ]
            ):
                continue

            items.append(
                {
                    "description": description,
                    "value": price_match.group(1).replace(",", "."),
                    "quantity": 1,
                    "category": "food_drinks",
                    "owners": [1, 2],
                }
            )

        return items

    @classmethod
    def _extract_items_biedronka(cls, text):
        lines = cls._normalize_lines(text)
        if not lines:
            return []

        items = []
        in_items_section = False

        for line in lines:
            normalized_line = line.lower()

            if "nazwa" in normalized_line and "cena" in normalized_line:
                in_items_section = True
                continue

            if not in_items_section:
                continue

            if cls._is_biedronka_summary_line(line):
                break

            if PAGE_FOOTER_RE.match(line):
                continue

            if normalized_line == "niefiskalny":
                continue

            if TAX_SUMMARY_LINE_RE.match(line):
                continue

            if cls._is_summary_or_payment_line(line):
                continue

            if normalized_line.startswith("rabat"):
                continue

            if NEGATIVE_PRICE_RE.search(line):
                continue

            if re.fullmatch(r"\d{4,}/\d+/\d+/\d{2}\.\d{2}\.\d{4}", line):
                continue

            parsed_product = cls._parse_biedronka_product_line(line)
            if parsed_product:
                items.append(
                    {
                        "description": parsed_product["description"],
                        "value": parsed_product["value"],
                        "quantity": parsed_product["quantity"],
                        "category": "food_drinks",
                        "owners": [1, 2],
                    }
                )
                continue

            if items and cls._looks_like_biedronka_name_continuation(line):
                previous_name = items[-1]["description"]
                merged_name = cls._merge_similar_name_lines(previous_name, line)
                items[-1]["description"] = merged_name

        return items

    @staticmethod
    def _normalize_quantity_token(quantity_token):
        if not quantity_token:
            return 1

        if quantity_token.endswith(".000") or quantity_token.endswith(",000"):
            try:
                return int(float(quantity_token.replace(",", ".")))
            except ValueError:
                return 1

        return 1

    @classmethod
    def _extract_items_generic(cls, text):
        items = []
        lines = cls._normalize_lines(text)

        for line in lines:
            normalized_line = line.lower()

            if IGNORE_LINE_RE.match(line):
                continue

            if TAX_SUMMARY_LINE_RE.match(line):
                continue

            if re.search(r"\b(brutto|netto|podatek)\b", normalized_line):
                continue

            if "podatek% brutto netto" in normalized_line:
                continue

            if cls._is_summary_or_payment_line(line):
                continue

            if any(
                phrase in normalized_line
                for phrase in [
                    "paragon fiskalny",
                    "nip",
                    "kasa",
                    "kasjer",
                    "terminal",
                    "gotowka",
                    "gotówka",
                    "karta",
                    "ptu",
                    "sprzedaz opod",
                    "sprzedaż opod",
                    "change",
                ]
            ):
                continue

            price_match = PRICE_RE.search(line)
            if not price_match:
                continue

            price_raw = price_match.group(1).replace(",", ".")
            description = line[: price_match.start()].strip(" -:;")
            quantity = 1

            inline_qty_match = GENERIC_QTY_INLINE_RE.search(description)
            if inline_qty_match:
                quantity = cls._normalize_quantity_token(inline_qty_match.group("qty"))
                description = description[: inline_qty_match.start()].strip(" -:;")

            description = re.sub(r"\b[A-Za-z]{1,2}\b$", "", description).strip()
            description = re.sub(r"\s{2,}", " ", description)

            if not description or len(description) < 2:
                continue

            if IGNORE_LINE_RE.match(description):
                continue

            if any(char.isdigit() for char in description[:2]) and len(description) < 8:
                continue

            items.append(
                {
                    "description": description,
                    "value": price_raw,
                    "quantity": quantity,
                    "category": "food_drinks",
                    "owners": [1, 2],
                }
            )

        return items

    @staticmethod
    def _normalize_lines(text):
        return [
            re.sub(r"\s+", " ", line).strip()
            for line in text.splitlines()
            if line and line.strip()
        ]

    @staticmethod
    def _is_summary_or_payment_line(line):
        normalized_line = line.lower()
        return any(
            phrase in normalized_line
            for phrase in [
                "ogółem",
                "ogolem",
                "suma pln",
                "sprzedaż opodatkowana",
                "sprzedaz opodatkowana",
                "suma ptu",
                "karta płatnicza",
                "numer transakcji",
                "numer klienta",
                "za ten zakup otrzymałeś",
                "podsumowanie zakupów:",
                "podatek %",
                "brutto",
                "netto",
            ]
        )

    @staticmethod
    def _is_biedronka_summary_line(line):
        normalized_line = line.lower()
        return any(
            normalized_line.startswith(prefix)
            for prefix in [
                "sprzedaż opodatkowana",
                "sprzedaz opodatkowana",
                "ptu ",
                "suma ptu",
                "suma pln",
                "kasa ",
                "kasjer",
                "karta płatnicza",
                "numer transakcji",
            ]
        )

    @classmethod
    def _parse_biedronka_product_line(cls, line):
        match = BIEDRONKA_PRODUCT_LINE_RE.match(line)
        if not match:
            return None

        description = match.group("name").strip(" -:;")
        description = re.sub(r"\s{2,}", " ", description)
        if not description or len(description) < 2:
            return None

        quantity = cls._normalize_quantity_token(match.group("qty"))
        total_value_raw = match.group("value") or match.group("unit")
        value = total_value_raw.replace(",", ".")

        return {
            "description": description,
            "quantity": quantity,
            "value": value,
        }

    @staticmethod
    def _looks_like_biedronka_name_continuation(line):
        if PRICE_ONLY_RE.match(line):
            return False
        if NEGATIVE_PRICE_RE.search(line):
            return False
        if any(char.isdigit() for char in line[-6:]):
            return False
        lowered = line.lower()
        if lowered.startswith("rabat"):
            return False
        if len(line) < 3:
            return False
        return any(character.isalpha() for character in line)

    @staticmethod
    def _merge_similar_name_lines(previous_name, next_line):
        previous_words = previous_name.split()
        next_words = next_line.split()
        if not previous_words:
            return next_line
        if not next_words:
            return previous_name

        similarity = SequenceMatcher(
            None, previous_name.lower(), next_line.lower()
        ).ratio()
        if similarity > 0.72:
            return previous_name

        if next_words[0].lower() in {word.lower() for word in previous_words[-2:]}:
            return previous_name

        return f"{previous_name} {next_line}".strip()


class ReceiptPdfUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        request=OpenApiRequest(
            request=ReceiptPdfUploadSerializer,
            encoding={"file": {"contentType": "application/pdf"}},
        ),
        responses={
            200: OpenApiResponse(description="Poprawnie sparsowano PDF paragonu."),
            400: OpenApiResponse(
                description="Błędny plik lub nie udało się przetworzyć PDF."
            ),
        },
        description="Upload pliku PDF paragonu. Endpoint przyjmuje plik PDF w polu `file` jako multipart/form-data.",
    )
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"detail": "Brak pliku PDF w polu 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".pdf"):
            return Response(
                {"detail": "Niepoprawny format pliku. Dozwolony jest tylko PDF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            parsed = ReceiptPdfParser.parse(uploaded_file)
        except Exception as exc:
            return Response(
                {
                    "detail": f"Nie udało się przetworzyć PDF: {exc}",
                    "hint": "Jeśli to skan lub obraz w PDF, sprawdź czy masz zainstalowane pytesseract, pdf2image oraz systemowe tesseract i poppler.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(parsed, status=status.HTTP_200_OK)


class ReceiptCrudView(APIView):
    def get(self, request, receipt_id=None, *args, **kwargs):
        if receipt_id is not None:
            receipt = get_object_or_404(Receipt, pk=receipt_id)
            return Response(self._serialize_receipt(receipt), status=status.HTTP_200_OK)

        receipts = Receipt.objects.prefetch_related("items").order_by(
            "-payment_date", "-id"
        )
        return Response(
            [self._serialize_receipt(receipt) for receipt in receipts],
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        payload = self._validate_payload(request.data)
        if "errors" in payload:
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        receipt = Receipt.objects.create(
            payment_date=payload["payment_date"],
            payer=payload["payer"],
            shop=payload["shop"],
            transaction_type=payload["transaction_type"],
        )

        Item.objects.bulk_create(
            [
                Item(
                    receipt=receipt,
                    description=item["description"],
                    value=item["value"],
                    quantity=item["quantity"],
                    category=item["category"],
                )
                for item in payload["items"]
            ]
        )

        receipt.refresh_from_db()
        return Response(
            self._serialize_receipt(receipt), status=status.HTTP_201_CREATED
        )

    @transaction.atomic
    def put(self, request, receipt_id=None, *args, **kwargs):
        if receipt_id is None:
            return Response(
                {"detail": "Brak receipt_id dla operacji update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt = get_object_or_404(Receipt, pk=receipt_id)
        payload = self._validate_payload(request.data)
        if "errors" in payload:
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        receipt.payment_date = payload["payment_date"]
        receipt.payer = payload["payer"]
        receipt.shop = payload["shop"]
        receipt.transaction_type = payload["transaction_type"]
        receipt.save()

        receipt.items.all().delete()
        Item.objects.bulk_create(
            [
                Item(
                    receipt=receipt,
                    description=item["description"],
                    value=item["value"],
                    quantity=item["quantity"],
                    category=item["category"],
                )
                for item in payload["items"]
            ]
        )

        receipt.refresh_from_db()
        return Response(self._serialize_receipt(receipt), status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, receipt_id=None, *args, **kwargs):
        if receipt_id is None:
            return Response(
                {"detail": "Brak receipt_id dla operacji delete."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt = get_object_or_404(Receipt, pk=receipt_id)
        receipt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _validate_payload(self, data):
        errors = {}

        payment_date_raw = data.get("payment_date")
        payment_date = parse_date(payment_date_raw) if payment_date_raw else None
        if not payment_date:
            errors["payment_date"] = (
                "Pole payment_date jest wymagane i musi mieć format YYYY-MM-DD."
            )

        payer = data.get("payer")
        if payer in [None, ""]:
            errors["payer"] = "Pole payer jest wymagane."

        shop = (data.get("shop") or "").strip()
        if not shop:
            errors["shop"] = "Pole shop jest wymagane."

        transaction_type = (data.get("transaction_type") or "").strip()
        if not transaction_type:
            errors["transaction_type"] = "Pole transaction_type jest wymagane."

        raw_items = data.get("items") or []
        if not isinstance(raw_items, list) or not raw_items:
            errors["items"] = "Pole items musi być niepustą listą."
            raw_items = []

        normalized_items = []
        for index, item in enumerate(raw_items):
            description = (item.get("description") or "").strip()
            category = (item.get("category") or "food_drinks").strip()
            quantity = item.get("quantity", 1)
            value_raw = item.get("value")

            item_errors = {}
            if not description:
                item_errors["description"] = "Opis jest wymagany."

            try:
                value = Decimal(str(value_raw).replace(",", "."))
            except (InvalidOperation, TypeError, AttributeError):
                item_errors["value"] = "Niepoprawna kwota."
                value = None

            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                item_errors["quantity"] = "Ilość musi być liczbą całkowitą."
                quantity = 1

            if item_errors:
                errors[f"items[{index}]"] = item_errors
                continue

            normalized_items.append(
                {
                    "description": description,
                    "category": category,
                    "quantity": quantity,
                    "value": value,
                }
            )

        if errors:
            return {"errors": errors}

        return {
            "payment_date": payment_date,
            "payer": payer,
            "shop": shop,
            "transaction_type": transaction_type,
            "items": normalized_items,
        }

    def _serialize_receipt(self, receipt):
        return {
            "id": receipt.id,
            "payment_date": str(receipt.payment_date),
            "payer": receipt.payer,
            "shop": receipt.shop,
            "transaction_type": receipt.transaction_type,
            "items": [
                {
                    "id": item.id,
                    "description": item.description,
                    "category": item.category,
                    "quantity": item.quantity,
                    "value": str(item.value),
                }
                for item in receipt.items.all().order_by("id")
            ],
        }
