import io
import tempfile

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


OCR_NOT_AVAILABLE_WARNING = (
    "Nie udało się odczytać tekstu z PDF. Ten plik prawdopodobnie zawiera obraz. "
    "Dla takich paragonów doinstaluj OCR: pytesseract, pdf2image oraz systemowo tesseract i poppler."
)


class ReceiptTextExtractor:
    def extract(self, uploaded_file):
        text = self._extract_pdf_text(uploaded_file)
        warning = None

        if not text.strip():
            text = self._extract_text_with_ocr(uploaded_file)
            if text.strip():
                warning = "Użyto OCR, bo PDF nie zawierał warstwy tekstowej."
            else:
                return {"text": "", "warning": OCR_NOT_AVAILABLE_WARNING}

        return {"text": text, "warning": warning}

    def _extract_pdf_text(self, uploaded_file):
        if PdfReader is None:
            raise RuntimeError("Brakuje zależności pypdf. Dodaj ją do backendu.")

        uploaded_file.seek(0)
        buffer = io.BytesIO(uploaded_file.read())
        uploaded_file.seek(0)

        reader = PdfReader(buffer)
        pages = [(page.extract_text() or "") for page in reader.pages]
        return "\n".join(pages)

    def _extract_text_with_ocr(self, uploaded_file):
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
