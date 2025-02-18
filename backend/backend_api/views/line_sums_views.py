# myapp/views/line_sums_views.py
from rest_framework.decorators import api_view
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from backend_api.views.utils import (
    get_query_params,
    get_all_dates_in_month,
    process_items,
    convert_sum_to_linear,
    handle_error,
)
from backend_api.models import Receipt


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
            name="month", description="Wybrany miesiąc", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Wybrany rok", required=True, type=int
        ),
    ],
    responses={
        200: {
            "type": "object",
            "example": {
                "1": {"income": [0.0, 10.0, 20.0], "expense": [5.0, 15.0, 25.0]},
                "global": {"income": [0.0, 10.0, 20.0], "expense": [5.0, 15.0, 25.0]},
            },
        }
    },
)
@api_view(["GET"])
def fetch_line_sums(request):
    try:
        params = get_query_params(request, "month", "year")
        selected_month = params["month"]
        selected_year = params["year"]

        owner_param = request.GET.getlist("owners[]")
        selected_owner_ids = [int(o) for o in owner_param] if owner_param else []
        if not selected_owner_ids:
            return handle_error("Nie podano ownersów", 400, "Brak parametru owners")
    except ValueError as e:
        return handle_error(e, 400, "Niepoprawne parametry zapytania")

    try:
        all_dates = get_all_dates_in_month(selected_year, selected_month)

        def get_receipts(owner=None):
            qs_expense = Receipt.objects.filter(
                transaction_type="expense",
                payment_date__month=selected_month,
                payment_date__year=selected_year,
            ).distinct()
            qs_income = Receipt.objects.filter(
                transaction_type="income",
                payment_date__month=selected_month,
                payment_date__year=selected_year,
            ).distinct()
            if owner is not None:
                qs_expense = qs_expense.filter(items__owners__id=owner)
                qs_income = qs_income.filter(items__owners__id=owner)
            return qs_expense, qs_income

        def process_and_format(owner=None):
            qs_expense, qs_income = get_receipts(owner)
            daily_expense = process_items(qs_expense)
            daily_income = process_items(qs_income)
            linear_expense = convert_sum_to_linear(daily_expense, all_dates)
            linear_income = convert_sum_to_linear(daily_income, all_dates)
            linear_expense = [round(val, 2) for val in linear_expense]
            linear_income = [round(val, 2) for val in linear_income]
            return linear_expense, linear_income

        results = {}
        for owner in selected_owner_ids:
            expense, income = process_and_format(owner)
            results[str(owner)] = {"expense": expense, "income": income}

        return JsonResponse(results, status=200)
    except Exception as e:
        return handle_error(e, 500, "Błąd podczas przetwarzania danych")
