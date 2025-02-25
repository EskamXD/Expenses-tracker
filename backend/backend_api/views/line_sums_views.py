from rest_framework.decorators import api_view
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter
from backend_api.views.utils import (
    get_query_params,
    get_all_dates_in_month,
    handle_error,
)
from backend_api.models import Receipt
from datetime import date


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

        selected_owner = int(owner_param[0])
    except ValueError as e:
        return handle_error(e, 400, "Niepoprawne parametry zapytania")

    try:
        # Konwertujemy daty od razu na string w formacie YYYY-MM-DD
        all_dates = [
            d.isoformat() if isinstance(d, date) else str(d)
            for d in get_all_dates_in_month(selected_year, selected_month)
        ]

        # Inicjalizujemy słowniki z datami jako stringami
        daily_expense = {date: 0 for date in all_dates}
        daily_income = {date: 0 for date in all_dates}

        # Pobieramy wszystkie paragony
        receipts = Receipt.objects.filter(
            payment_date__month=selected_month,
            payment_date__year=selected_year,
            items__owners__id=selected_owner,
        ).distinct()

        # Przetwarzanie każdego paragonu
        for receipt in receipts:
            for item in receipt.items.all():
                if selected_owner in [owner.id for owner in item.owners.all()]:
                    # Dzielimy wartość przez ilość właścicieli
                    num_owners = item.owners.count()
                    value_per_owner = (
                        float(item.value) / num_owners if num_owners else 0
                    )

                    # Sprawdzamy, czy data jest typu datetime.date
                    if isinstance(receipt.payment_date, date):
                        payment_date_str = receipt.payment_date.isoformat()
                    else:
                        payment_date_str = str(receipt.payment_date)

                    # Dodajemy wartość do odpowiedniego dnia
                    if receipt.transaction_type == "expense":
                        daily_expense[payment_date_str] += value_per_owner
                    elif receipt.transaction_type == "income":
                        daily_income[payment_date_str] += value_per_owner

        # Kumulacja wartości dzień po dniu
        results = []
        cumulative_expense = 0
        cumulative_income = 0

        for day_str in all_dates:
            cumulative_expense += daily_expense[day_str]
            cumulative_income += daily_income[day_str]

            results.append(
                {
                    "day": day_str,  # Data już jest stringiem w formacie YYYY-MM-DD
                    "expense": round(cumulative_expense, 2),
                    "income": round(cumulative_income, 2),
                }
            )

        return JsonResponse(results, safe=False, status=200)
    except Exception as e:
        return handle_error(e, 500, f"Błąd podczas przetwarzania danych: {str(e)}")
