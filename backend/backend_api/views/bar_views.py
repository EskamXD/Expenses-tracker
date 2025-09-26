# myapp/views/bar_views.py
from collections import defaultdict
from decimal import Decimal
from django.http import JsonResponse
from django.db.models import Sum, FloatField, Prefetch
from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from backend_api.views.utils import (
    get_query_params,
    handle_error,
    get_top_outlier_receipts,
)
from backend_api.models import Receipt
from backend_api.serializers import PersonExpenseSerializer, ShopExpenseSerializer


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="month", description="Selected month", required=False, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
        ),
        OpenApiParameter(
            name="category", description="Selected category", required=False, type=list
        ),
        OpenApiParameter(
            name="period",
            description="Wybrany okres (np. period=month).",
            required=True,
            type=str,
        ),
    ],
    responses={
        200: OpenApiResponse(description="List of expenses with receipts"),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def fetch_bar_persons(request):
    try:
        selected_year = int(request.GET.get("year"))
    except (ValueError, TypeError):
        return JsonResponse(
            {"error": "Invalid or missing 'year' parameter"}, status=400
        )

    period = request.GET.get("period", "monthly")
    if period == "month":
        period = "monthly"

    selected_month = None
    if period == "monthly":
        try:
            selected_month = int(request.GET.get("month"))
        except (ValueError, TypeError):
            return JsonResponse(
                {"error": "Invalid or missing 'month' parameter"}, status=400
            )

    categories = request.GET.getlist("category[]")
    if not categories:
        categories = request.GET.getlist("category")

    owners_param = request.GET.getlist("owners[]")
    try:
        selected_owner_ids = [int(o) for o in owners_param] if owners_param else []
    except (ValueError, TypeError):
        return JsonResponse({"error": "Invalid 'owners[]' parameter"}, status=400)

    try:
        time_filter = {"payment_date__year": selected_year}
        if selected_month is not None:
            time_filter["payment_date__month"] = selected_month

        receipts_qs = (
            Receipt.objects.filter(
                transaction_type="expense",
                **time_filter,
            )
            .prefetch_related(Prefetch("items", to_attr="prefetched_items"))
            .select_related("payer")
        )

        if selected_owner_ids:
            receipts_qs = receipts_qs.filter(payer__id__in=selected_owner_ids)

        shared_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set(), "top_outliers": []}
        )
        not_own_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set(), "top_outliers": []}
        )

        all_payers = set()

        for receipt in receipts_qs:
            payer = receipt.payer
            if payer is None:
                continue
            all_payers.add(payer)

            for item in getattr(receipt, "prefetched_items", []):
                if getattr(item, "category", None) == "last_month_balance":
                    continue
                if categories and getattr(item, "category", None) not in categories:
                    continue

                owners = list(item.owners.all())
                owners_count = len(owners)

                if owners_count > 1 and payer in owners:
                    try:
                        shared_expense_sums[payer]["sum"] += Decimal(item.value)
                        shared_expense_sums[payer]["receipt_ids"].add(receipt.id)
                    except (ValueError, TypeError):
                        continue

                if payer not in owners:
                    try:
                        not_own_expense_sums[payer]["sum"] += Decimal(item.value)
                        not_own_expense_sums[payer]["receipt_ids"].add(receipt.id)
                    except (ValueError, TypeError):
                        continue

        # outliers
        for data in shared_expense_sums.values():
            data["top_outliers"] = get_top_outlier_receipts(data["receipt_ids"])
        for data in not_own_expense_sums.values():
            data["top_outliers"] = get_top_outlier_receipts(data["receipt_ids"])

        # dodaj brakujących payerów z zerami
        for payer in all_payers:
            if payer not in shared_expense_sums:
                shared_expense_sums[payer] = {
                    "sum": Decimal(0),
                    "receipt_ids": set(),
                    "top_outliers": [],
                }
            if payer not in not_own_expense_sums:
                not_own_expense_sums[payer] = {
                    "sum": Decimal(0),
                    "receipt_ids": set(),
                    "top_outliers": [],
                }

        sorted_shared_expenses = sorted(
            shared_expense_sums.items(), key=lambda x: x[1]["sum"], reverse=True
        )
        sorted_not_own_expenses = sorted(
            not_own_expense_sums.items(), key=lambda x: x[1]["sum"], reverse=True
        )

        response_data = {
            "shared_expenses": [
                {
                    "payer": payer.id,
                    "expense_sum": float(data["sum"]),
                    "receipt_ids": list(data["receipt_ids"]),
                    "top_outlier_receipts": data["top_outliers"],
                }
                for payer, data in sorted_shared_expenses
            ],
            "not_own_expenses": [
                {
                    "payer": payer.id,
                    "expense_sum": float(data["sum"]),
                    "receipt_ids": list(data["receipt_ids"]),
                    "top_outlier_receipts": data["top_outliers"],
                }
                for payer, data in sorted_not_own_expenses
            ],
        }
        return JsonResponse(response_data, safe=False, status=200)

    except Exception as e:
        return JsonResponse(
            {"error": f"{str(e)} - Error while fetching bar persons"},
            status=500,
        )


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Selected owner ID",
            required=True,
            type=int,
            many="true",
        ),
        OpenApiParameter(
            name="month", description="Selected month", required=False, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
        ),
        OpenApiParameter(
            name="category[]",
            description="Selected category",
            required=False,
            type=str,
            many=True,
            enum=[
                "fuel",
                "car_expenses",
                "fastfood",
                "alcohol",
                "food_drinks",
                "chemistry",
                "clothes",
                "electronics_games",
                "tickets_entrance",
                "other_shopping",
                "flat_bills",
                "monthly_subscriptions",
                "other_cyclical_expenses",
                "investments_savings",
                "other",
            ],
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
        200: PersonExpenseSerializer(many=True),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def fetch_bar_shops(request):
    # --- 1) Rok i okres ---
    try:
        selected_year = int(request.GET.get("year"))
    except (TypeError, ValueError):
        return handle_error(
            "Brak lub niepoprawny 'year'", 400, "Niepoprawne parametry zapytania"
        )

    period = request.GET.get("period", "monthly")
    if period == "month":  # zgodność wsteczna
        period = "monthly"

    selected_month = None
    if period == "monthly":
        try:
            selected_month = int(request.GET.get("month"))
        except (TypeError, ValueError):
            return handle_error(
                "Brak lub niepoprawny 'month' dla monthly",
                400,
                "Niepoprawne parametry zapytania",
            )

    # --- 2) Owners (wymagane co najmniej 1) ---
    owners_param = request.GET.getlist("owners[]")
    try:
        selected_owner_ids = [int(o) for o in owners_param] if owners_param else []
    except (ValueError, TypeError):
        return handle_error(
            "Niepoprawny owners[]", 400, "Niepoprawne parametry zapytania"
        )

    if not selected_owner_ids:
        return handle_error("Nie podano ownersów", 400, "Brak parametru owners")

    # --- 3) Typ transakcji ---
    tx_type = request.GET.get("transactionType", "expense")  # domyślnie wydatki
    tx_filter = {}
    if tx_type in ("expense", "income"):
        tx_filter["transaction_type"] = tx_type
    # jeśli tx_type == "" → oba typy (bez filtra)

    # --- 4) Kategorie (czytaj category[] i/lub category) ---
    categories = request.GET.getlist("category[]") or request.GET.getlist("category")

    # Domyślne zestawy kategorii (z Twojej listy)
    expense_defaults = [
        "fuel",
        "car_expenses",
        "fastfood",
        "alcohol",
        "food_drinks",
        "chemistry",
        "clothes",
        "electronics_games",
        "tickets_entrance",
        "delivery",
        "other_shopping",
        "flat_bills",
        "monthly_subscriptions",
        "other_cyclical_expenses",
        "investments_savings",
        "other",
    ]
    income_defaults = [
        "for_study",
        "work_income",
        "family_income",
        "investments_income",
        "money_back",
        "other",
    ]

    if not categories:
        if tx_type == "expense":
            categories = expense_defaults
        elif tx_type == "income":
            categories = income_defaults
        else:
            # oba typy → domyślne obie listy
            categories = expense_defaults + income_defaults

    # --- 5) Budowa filtra czasu + reszta ---
    time_filter = {"payment_date__year": selected_year}
    if selected_month is not None:
        time_filter["payment_date__month"] = selected_month

    categories = [c for c in categories if c != "last_month_balance"]

    try:
        base_filter = {
            **tx_filter,
            **time_filter,
            "items__category__in": categories,
            "items__owners__id__in": selected_owner_ids,
        }

        # Agregacja po stronie bazy — tu prefetch_related nie pomaga
        queryset = (
            Receipt.objects.filter(**base_filter)
            .values("shop")
            .annotate(expense_sum=Sum("items__value", output_field=FloatField()))
            .order_by("-expense_sum")
        )

        # Serializacja (zaokrąglamy do 2 miejsc)
        serialized_data = [
            {"shop": row["shop"], "expense_sum": round(row["expense_sum"] or 0.0, 2)}
            for row in queryset
        ]

        serializer = ShopExpenseSerializer(data=serialized_data, many=True)
        if serializer.is_valid():
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)

    except Exception as e:
        return handle_error(e, 500, "Error while fetching bar shops")
