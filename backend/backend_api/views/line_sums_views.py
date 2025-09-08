from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, OpenApiParameter
from backend_api.views.utils import (
    get_query_params,
    get_all_dates_in_month,
    handle_error,
)
from backend_api.models import Receipt, Item


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Lista ID właścicieli (np. owners[]=1&owners[]=2). Tylko pierwszy element zostanie wykorzystany.",
            required=True,
            type=int,
            many=True,
        ),
        OpenApiParameter(
            name="month", description="Wybrany miesiąc", required=False, type=int
        ),
        OpenApiParameter(
            name="year", description="Wybrany rok", required=True, type=int
        ),
        OpenApiParameter(
            name="period",
            description="Wybrany okres (np. period=month).",
            required=True,
            type=str,
        ),
    ],
    responses={
        200: {
            "type": "array",
            "example": [
                {"day": "2024-01-01", "expense": 5.0, "income": 0.0},
                {"day": "2024-01-02", "expense": 15.0, "income": 10.0},
                {"day": "2024-01-03", "expense": 25.0, "income": 20.0},
            ],
        }
    },
)
@api_view(["GET"])
def fetch_line_sums(request):
    try:
        params = get_query_params(request, "year")
        selected_year = params["year"]

        owner_param = request.GET.getlist("owners[]")
        if not owner_param:
            return handle_error("Nie podano ownersów", 400, "Brak parametru owners")
        selected_owner = int(owner_param[0])

        period = request.GET.get("period", "monthly")
        if period == "month":
            period = "monthly"

        # --- zbuduj filtr czasu i queryset z prefetch (zero N+1) ---
        time_filter = {"payment_date__year": selected_year}
        if period == "monthly":
            params_m = get_query_params(request, "month")
            selected_month = params_m["month"]
            time_filter["payment_date__month"] = selected_month

        receipts_qs = (
            Receipt.objects.filter(**time_filter, items__owners__id=selected_owner)
            .distinct()
            .prefetch_related(
                # pobierz items i od razu ownerów pozycji
                Prefetch("items", queryset=Item.objects.prefetch_related("owners"))
            )
        )

        if period == "monthly":
            # 1) Bufory dzienne (stringi YYYY-MM-DD)
            all_days = get_all_dates_in_month(selected_year, selected_month)
            daily_expense = {d: 0.0 for d in all_days}
            daily_income = {d: 0.0 for d in all_days}

            # 2) Sumuj w Pythonie (bez podwójnego liczenia)
            for receipt in receipts_qs:
                day_str = (
                    receipt.payment_date.isoformat()
                    if hasattr(receipt.payment_date, "isoformat")
                    else str(receipt.payment_date)
                )
                if day_str not in daily_expense:
                    # (gdyby wpadła data spoza miesiąca – nie powinna)
                    daily_expense[day_str] = 0.0
                    daily_income[day_str] = 0.0

                tx = receipt.transaction_type
                for item in receipt.items.all():
                    # liczymy tylko jeśli selected_owner jest wśród owners pozycji
                    if item.category == "last_month_balance":
                        continue
                    if not item.owners.filter(id=selected_owner).exists():
                        continue
                    owners_count = item.owners.count()
                    share = float(item.value) / owners_count if owners_count else 0.0
                    if tx == "expense":
                        daily_expense[day_str] += share
                    elif tx == "income":
                        daily_income[day_str] += share

            # 3) Kumulacja
            results, cum_exp, cum_inc = [], 0.0, 0.0
            for day_str in all_days:
                cum_exp += daily_expense[day_str]
                cum_inc += daily_income[day_str]
                results.append(
                    {
                        "day": day_str,
                        "expense": round(cum_exp, 2),
                        "income": round(cum_inc, 2),
                    }
                )
            return JsonResponse(results, safe=False, status=200)

        else:  # yearly
            monthly_expense = {m: 0.0 for m in range(1, 13)}
            monthly_income = {m: 0.0 for m in range(1, 13)}

            # Sumowanie miesięczne
            for receipt in receipts_qs:
                m = receipt.payment_date.month
                tx = receipt.transaction_type
                for item in receipt.items.all():
                    if item.category == "last_month_balance":
                        continue
                    if not item.owners.filter(id=selected_owner).exists():
                        continue
                    owners_count = item.owners.count()
                    share = float(item.value) / owners_count if owners_count else 0.0
                    if tx == "expense":
                        monthly_expense[m] += share
                    elif tx == "income":
                        monthly_income[m] += share

            # Kumulacja miesiąc po miesiącu
            results, cum_exp, cum_inc = [], 0.0, 0.0
            for m in range(1, 13):
                cum_exp += monthly_expense[m]
                cum_inc += monthly_income[m]
                results.append(
                    {
                        "day": f"{selected_year}-{m:02d}-01",
                        "expense": round(cum_exp, 2),
                        "income": round(cum_inc, 2),
                    }
                )
            return JsonResponse(results, safe=False, status=200)

    except ValueError as e:
        return handle_error(e, 400, "Niepoprawne parametry zapytania")
    except Exception as e:
        return handle_error(e, 500, f"Błąd podczas przetwarzania danych: {str(e)}")
