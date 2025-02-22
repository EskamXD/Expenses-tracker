# myapp/views/line_sums_views.py
from rest_framework.decorators import api_view
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter
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
            description="Lista ID właścicieli (np. owners[]=1&owners[]=2). Tylko pierwszy element zostanie wykorzystany.",
            required=True,
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
        params = get_query_params(request, "month", "year")
        selected_month = params["month"]
        selected_year = params["year"]

        owner_param = request.GET.getlist("owners[]")
        if not owner_param:
            return handle_error("Nie podano ownersów", 400, "Brak parametru owners")
        # Używamy tylko pierwszego elementu z listy owners
        selected_owner = int(owner_param[0])
    except ValueError as e:
        return handle_error(e, 400, "Niepoprawne parametry zapytania")

    try:
        all_dates = get_all_dates_in_month(selected_year, selected_month)

        qs_expense = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
            items__owners__id=selected_owner,
        ).distinct()
        qs_income = Receipt.objects.filter(
            transaction_type="income",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
            items__owners__id=selected_owner,
        ).distinct()

        daily_expense = process_items(qs_expense)
        daily_income = process_items(qs_income)

        linear_expense = convert_sum_to_linear(daily_expense, all_dates)
        linear_income = convert_sum_to_linear(daily_income, all_dates)

        linear_expense = [round(val, 2) for val in linear_expense]
        linear_income = [round(val, 2) for val in linear_income]

        results = []
        for d, exp, inc in zip(all_dates, linear_expense, linear_income):
            results.append(
                {
                    "day": d.isoformat() if hasattr(d, "isoformat") else str(d),
                    "expense": exp,
                    "income": inc,
                }
            )

        return JsonResponse(results, safe=False, status=200)
    except Exception as e:
        return handle_error(e, 500, "Błąd podczas przetwarzania danych")
