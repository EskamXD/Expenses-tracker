from rest_framework.decorators import api_view
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from django.db.models import Sum
from django.core.exceptions import ValidationError
from backend_api.views.utils import get_query_params, handle_error
from backend_api.models import Receipt, Item
from backend_api.serializers import CategoryPieExpenseSerializer


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Lista ID właścicieli (np. owners[]=1&owners[]=2)",
            required=False,
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
            name="transactionType",
            description="Selected transaction type",
            required=True,
            type=str,
        ),
        OpenApiParameter(
            name="period",
            description="Wybrany okres (np. period=month).",
            required=True,
            type=str,
        ),
    ],
    responses={
        200: CategoryPieExpenseSerializer(many=True),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def fetch_pie_categories(request):
    try:
        # --- 1) Rok + period (alias 'month' => 'monthly') ---
        params_y = get_query_params(request, "year")
        selected_year = params_y["year"]

        period = request.GET.get("period", "monthly")
        if period == "month":
            period = "monthly"

        selected_month = None
        if period == "monthly":
            params_m = get_query_params(request, "month")
            selected_month = params_m["month"]

        # --- 2) Typ transakcji ("" = oba) ---
        tx_type = request.GET.get("transactionType", "expense")

        # --- 3) Owners (opcjonalnie) ---
        owners_param = request.GET.getlist("owners[]")
        selected_owner_ids = [int(o) for o in owners_param] if owners_param else []

        # --- 4) Zbuduj queryset paragonów ---
        time_filter = {"payment_date__year": selected_year}
        if selected_month is not None:
            time_filter["payment_date__month"] = selected_month

        receipts = Receipt.objects.filter(**time_filter)
        if tx_type in ("expense", "income"):
            receipts = receipts.filter(transaction_type=tx_type)
        if selected_owner_ids:
            # zawężamy do paragonów, które mają pozycje z co najmniej jednym z wybranych ownerów
            receipts = receipts.filter(items__owners__id__in=selected_owner_ids)
        receipts = receipts.distinct()

        # --- 5) Pobierz pozycje tych paragonów z ownerami (zero N+1) ---
        items = (
            Item.objects.filter(receipts__in=receipts)
            .prefetch_related("owners")
            .distinct()
        )

        # --- 6) Sumowanie per kategoria z udziałem per owner (value / owners_count) ---
        category_totals = {}
        for item in items:
            if item.category == "last_month_balance":
                continue
            owners_count = item.owners.count()
            if owners_count == 0:
                # brak ownerów - traktujemy jako 0 udziału
                continue
            share = float(item.value) / owners_count
            cat = item.category
            category_totals[cat] = category_totals.get(cat, 0.0) + share

        # --- 7) Serializacja do oczekiwanego formatu ---
        aggregated_data = [
            {
                "category": cat,
                "expense_sum": round(total, 2),
                "fill": f"var(--color-{cat})",
            }
            for cat, total in sorted(category_totals.items(), key=lambda kv: kv[0])
        ]

        from backend_api.serializers import CategoryPieExpenseSerializer

        serializer = CategoryPieExpenseSerializer(data=aggregated_data, many=True)
        if serializer.is_valid():
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            return JsonResponse(serializer.errors, safe=False, status=400)

    except ValidationError as e:
        return handle_error(e, 400, "Invalid category")
    except Exception as e:
        return handle_error(e, 500, f"Error while fetching pie categories: {str(e)}")
