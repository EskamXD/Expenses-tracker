# myapp/views/utils.py
import calendar
from django.http import JsonResponse
from django.db.models import Sum, FloatField
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils.timezone import now


def get_all_dates_in_month(selected_year, selected_month):
    _, last_day = calendar.monthrange(int(selected_year), int(selected_month))
    return [
        f"{selected_year}-{selected_month:02d}-{day:02d}"
        for day in range(1, last_day + 1)
    ]


def get_query_params(request, *params):
    values = {}
    for param in params:
        value = request.GET.get(param)
        if value is None:
            raise ValueError(f"Missing parameter: {param}")
        try:
            values[param] = int(value)
        except ValueError:
            raise ValueError(f"Invalid value for parameter: {param}")
    return values


def handle_error(exception: Exception, status_code: int, context: str = ""):
    return JsonResponse({"error": f"{str(exception)} {context}"}, status=status_code)


def process_items(receipts):
    daily_sums = {}
    for receipt in receipts:
        for item in receipt.items.all():
            date = str(receipt.payment_date)
            value = float(item.value)
            daily_sums[date] = daily_sums.get(date, 0) + value
    return daily_sums


def convert_sum_to_linear(daily_sums, all_dates):
    linear_sum = []
    current_sum = 0
    for date in all_dates:
        current_sum += daily_sums.get(date, 0)
        linear_sum.append(current_sum)
    return linear_sum


def get_top_outlier_receipts(receipt_ids, num_top=3):
    from backend_api.models import (
        Receipt,
    )  # importuj lokalnie, aby uniknąć cyklicznych zależności

    receipts = Receipt.objects.filter(id__in=receipt_ids).prefetch_related("items")
    sorted_receipts = sorted(
        receipts, key=lambda r: sum(item.value for item in r.items.all()), reverse=True
    )
    return [r.id for r in sorted_receipts[:num_top]]
