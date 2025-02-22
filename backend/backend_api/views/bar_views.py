# myapp/views/bar_views.py
from collections import defaultdict
from decimal import Decimal
from django.http import JsonResponse
from django.db.models import Sum, FloatField
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
            name="month", description="Selected month", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
        ),
        OpenApiParameter(
            name="category", description="Selected category", required=False, type=list
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
        selected_month = int(request.GET.get("month"))
        selected_year = int(request.GET.get("year"))
        selected_categories = request.GET.getlist("category")
    except (ValueError, TypeError):
        return JsonResponse({"error": "Invalid query parameters"}, status=400)

    try:
        receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__year=selected_year,
            payment_date__month=selected_month,
        ).prefetch_related("items")

        shared_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set(), "top_outliers": []}
        )
        not_own_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set(), "top_outliers": []}
        )

        for receipt in receipts:
            payer = receipt.payer
            for item in receipt.items.all():
                owners = list(item.owners.all())
                if selected_categories and item.category not in selected_categories:
                    continue
                if len(owners) > 1 and payer in owners:
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

        for payer, data in shared_expense_sums.items():
            shared_expense_sums[payer]["top_outliers"] = get_top_outlier_receipts(
                data["receipt_ids"]
            )

        for payer, data in not_own_expense_sums.items():
            not_own_expense_sums[payer]["top_outliers"] = get_top_outlier_receipts(
                data["receipt_ids"]
            )

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
            {"error": f"{str(e)} - Error while fetching bar persons"}, status=500
        )


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Selected owner ID",
            required=False,
            type=int,
            many="true",
        ),
        OpenApiParameter(
            name="month", description="Selected month", required=True, type=int
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
    ],
    responses={
        200: PersonExpenseSerializer(many=True),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def fetch_bar_shops(request):
    try:
        params = get_query_params(request, "month", "year")
        selected_month = params["month"]
        selected_year = params["year"]

        owners_param = request.GET.getlist("owners[]")
        selected_owner_ids = [int(o) for o in owners_param] if owners_param else []
        if not selected_owner_ids:
            return handle_error("Nie podano ownersów", 400, "Brak parametru owners")

        category_param = request.GET.getlist("category[]")
        category = (
            category_param
            if category_param
            else [
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
            ]
        )

    except ValueError as e:
        return handle_error(e, 400, "Niepoprawne parametry zapytania")

    try:
        queryset = (
            Receipt.objects.filter(
                transaction_type="expense",
                payment_date__year=selected_year,
                payment_date__month=selected_month,
                items__category__in=category,
                items__owners__id__in=selected_owner_ids,
            )
            .values("shop")
            .annotate(expense_sum=Sum("items__value", output_field=FloatField()))
        )
        sorted_expense_sums = queryset.order_by("-expense_sum")
        sorted_list = list(sorted_expense_sums)
        serialized_data = [
            {"shop": entry["shop"], "expense_sum": round(entry["expense_sum"], 2)}
            for entry in sorted_list
        ]
        serializer = ShopExpenseSerializer(data=serialized_data, many=True)
        if serializer.is_valid():
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return handle_error(e, 500, "Error while fetching bar shops")
