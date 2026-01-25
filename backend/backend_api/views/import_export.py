# backend_api/views/import_export.py
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
import io
import json
import os
import tempfile
import zipfile
from typing import Dict, Iterator, List, Tuple

from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import FileResponse, HttpRequest, HttpResponseBadRequest, JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser

from drf_spectacular.utils import (
    extend_schema,
    OpenApiResponse,
)
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

from backend_api.models import Item, Person, Receipt


EXPORT_BATCH_SIZE = 2000
IMPORT_BATCH_SIZE = 200  # tu powstają też Itemy + M2M → lepiej mniejsze batch
MAX_ERROR_SAMPLES = 50


# -------------------------
# DRF serializers for Swagger
# -------------------------


class ImportFileSerializer(serializers.Serializer):
    file = serializers.FileField(
        help_text="Plik .ndjson albo .zip z receipts.ndjson w środku"
    )


class ImportResultSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    inserted = serializers.IntegerField(help_text="Ile Receipt utworzono")
    errors = serializers.IntegerField(help_text="Ile linii NDJSON miało błędy")
    errorSamples = serializers.ListField(child=serializers.DictField(), required=False)


# -------------------------
# Export helpers
# -------------------------


def _iter_queryset(qs, batch_size: int = EXPORT_BATCH_SIZE) -> Iterator[Receipt]:
    yield from qs.iterator(chunk_size=batch_size)


def _receipt_to_dict(r: Receipt) -> Dict:
    items_payload: List[Dict] = []
    for it in r.items.all():
        items_payload.append(
            {
                "category": it.category,
                "value": str(it.value),
                "description": it.description,
                "quantity": str(it.quantity),
                "ownerIds": list(it.owners.values_list("id", flat=True)),
            }
        )

    return {
        "paymentDate": r.payment_date.isoformat(),
        "payerId": r.payer_id,
        "shop": r.shop,
        "transactionType": r.transaction_type,
        "items": items_payload,
    }


def _write_ndjson_to_file(file_obj, qs) -> int:
    count = 0
    for r in _iter_queryset(qs):
        file_obj.write(json.dumps(_receipt_to_dict(r), ensure_ascii=False) + "\n")
        count += 1
    return count


# -------------------------
# Import helpers
# -------------------------


@dataclass
class ImportResult:
    inserted: int = 0
    errors: int = 0
    error_samples: List[Dict] = None

    def __post_init__(self):
        if self.error_samples is None:
            self.error_samples = []


def _validate_receipt_payload(payload: Dict) -> Dict:
    if not isinstance(payload, dict):
        raise ValidationError("Linia nie jest obiektem JSON")

    required = ["paymentDate", "payerId", "shop", "transactionType", "items"]
    for k in required:
        if k not in payload:
            raise ValidationError(f"Brak pola: {k}")

    if not isinstance(payload.get("items"), list):
        raise ValidationError("items: musi być listą")

    return payload


def _payload_to_receipt_and_items(payload: Dict) -> Tuple[Receipt, List[Dict]]:
    payment_date = parse_date(payload.get("paymentDate"))
    if not payment_date:
        raise ValidationError("paymentDate: niepoprawna data (YYYY-MM-DD)")

    payer_id = payload.get("payerId")
    if not payer_id:
        raise ValidationError("payerId: wymagane")

    try:
        payer = Person.objects.get(id=payer_id)
    except Person.DoesNotExist:
        raise ValidationError(f"payerId: Person id={payer_id} nie istnieje")

    tx = payload.get("transactionType")
    if tx not in dict(Receipt.TRANSACTION_CHOICES):
        raise ValidationError("transactionType: niepoprawna wartość")

    receipt = Receipt(
        payment_date=payment_date,
        payer=payer,
        shop=str(payload.get("shop", "")),
        transaction_type=tx,
    )
    items_payload = payload.get("items") or []
    return receipt, items_payload


def _create_item_from_payload(item_payload: Dict) -> Item:
    category = item_payload.get("category")
    if category not in dict(Item.CATEGORY_CHOICES):
        raise ValidationError("item.category: niepoprawna wartość")

    try:
        value = Decimal(str(item_payload.get("value")))
    except Exception:
        raise ValidationError("item.value: niepoprawna liczba")

    try:
        quantity = Decimal(str(item_payload.get("quantity", "1")))
    except Exception:
        raise ValidationError("item.quantity: niepoprawna liczba")

    description = str(item_payload.get("description", ""))

    return Item(
        category=category,
        value=value,
        quantity=quantity,
        description=description,
    )


def _flush_batch(batch: List[Tuple[Receipt, List[Dict]]], result: ImportResult) -> None:
    with transaction.atomic():
        for receipt_obj, items_payload in batch:
            receipt_obj.save()

            created_items: List[Item] = []
            for ip in items_payload:
                item = _create_item_from_payload(ip)
                item.save()

                owner_ids = ip.get("ownerIds", [])
                if owner_ids:
                    owners = list(Person.objects.filter(id__in=owner_ids))
                    if len(owners) != len(set(owner_ids)):
                        missing = set(owner_ids) - set(o.id for o in owners)
                        raise ValidationError(
                            f"item.ownerIds: brak Person id: {sorted(missing)}"
                        )
                    item.owners.set(owners)

                created_items.append(item)

            if created_items:
                receipt_obj.items.set(created_items)

            result.inserted += 1


def _iter_ndjson_lines(stream: io.BufferedReader) -> Iterator[Tuple[int, str]]:
    for idx, raw in enumerate(stream, start=1):
        line = raw.decode("utf-8", errors="replace").strip()
        if line:
            yield idx, line


def _import_ndjson_stream(stream: io.BufferedReader) -> ImportResult:
    result = ImportResult()
    batch: List[Tuple[Receipt, List[Dict]]] = []

    for line_no, line in _iter_ndjson_lines(stream):
        try:
            payload = json.loads(line)
            payload = _validate_receipt_payload(payload)
            receipt_obj, items_payload = _payload_to_receipt_and_items(payload)

            batch.append((receipt_obj, items_payload))
            if len(batch) >= IMPORT_BATCH_SIZE:
                _flush_batch(batch, result)
                batch.clear()

        except Exception as e:
            result.errors += 1
            if len(result.error_samples) < MAX_ERROR_SAMPLES:
                result.error_samples.append({"line": line_no, "error": str(e)})

    if batch:
        _flush_batch(batch, result)
        batch.clear()

    return result


# -------------------------
# Views (DRF + Swagger)
# -------------------------


@extend_schema(
    methods=["GET"],
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.BINARY,
            description="ZIP file (receipts.ndjson + manifest.json)",
        ),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def export_receipts_zip(request: HttpRequest):
    """
    GET /api/receipts/export.zip
    Zwraca ZIP z receipts.ndjson (NDJSON) + manifest.json
    """
    try:
        qs = (
            Receipt.objects.all()
            .order_by("id")
            .select_related("payer")
            .prefetch_related("items__owners", "items")
        )

        tmp_zip = tempfile.NamedTemporaryFile(
            prefix="receipts_", suffix=".zip", delete=False
        )
        tmp_zip_path = tmp_zip.name
        tmp_zip.close()

        nd_path = None
        exported_count = 0

        try:
            with zipfile.ZipFile(
                tmp_zip_path, "w", compression=zipfile.ZIP_DEFLATED
            ) as zf:
                with tempfile.NamedTemporaryFile(
                    prefix="receipts_",
                    suffix=".ndjson",
                    mode="w",
                    encoding="utf-8",
                    delete=False,
                ) as nd:
                    nd_path = nd.name
                    exported_count = _write_ndjson_to_file(nd, qs)

                manifest = {
                    "schemaVersion": 1,
                    "exportedAt": timezone.now().isoformat(),
                    "count": exported_count,
                }

                zf.write(nd_path, arcname="receipts.ndjson")
                zf.writestr(
                    "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2)
                )

            filename = f"receipts_{timezone.now().date().isoformat()}.zip"
            resp = FileResponse(
                open(tmp_zip_path, "rb"), as_attachment=True, filename=filename
            )
            resp["X-Exported-Count"] = str(exported_count)
            return resp

        finally:
            # ndjson sprzątamy od razu
            try:
                if nd_path and os.path.exists(nd_path):
                    os.remove(nd_path)
            except Exception:
                pass
            # zip-a nie kasujemy tutaj, bo FileResponse czyta go w trakcie odpowiedzi.
            # /tmp czyść systemowo (tmpreaper/cron) albo zrób osobny cleanup.

    except Exception as e:
        return JsonResponse(
            {"error": f"{str(e)} - Error while exporting receipts"}, status=500
        )


@extend_schema(
    methods=["POST"],
    request=ImportFileSerializer,
    responses={
        200: ImportResultSerializer,
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser])
def import_receipts(request: HttpRequest):
    """
    POST /api/receipts/import
    multipart/form-data: file (.ndjson lub .zip z .ndjson)
    """
    try:
        f = request.FILES.get("file")
        if not f:
            return HttpResponseBadRequest("Brak pliku w polu 'file'")

        name = (f.name or "").lower()

        if name.endswith(".zip"):
            with zipfile.ZipFile(f) as zf:
                ndjson_files = [
                    n for n in zf.namelist() if n.lower().endswith(".ndjson")
                ]
                if not ndjson_files:
                    return HttpResponseBadRequest("ZIP nie zawiera pliku .ndjson")

                chosen = (
                    "receipts.ndjson"
                    if "receipts.ndjson" in ndjson_files
                    else ndjson_files[0]
                )
                with zf.open(chosen) as nd_stream:
                    result = _import_ndjson_stream(nd_stream)

        elif name.endswith(".ndjson"):
            result = _import_ndjson_stream(f.file)

        else:
            return HttpResponseBadRequest(
                "Obsługiwane formaty: .ndjson lub .zip (.ndjson w środku)"
            )

        return JsonResponse(
            {
                "ok": True,
                "inserted": result.inserted,
                "errors": result.errors,
                "errorSamples": result.error_samples,
            },
            status=200,
        )

    except zipfile.BadZipFile:
        return HttpResponseBadRequest("Niepoprawny plik ZIP")
    except Exception as e:
        return JsonResponse(
            {"error": f"{str(e)} - Error while importing receipts"}, status=500
        )
