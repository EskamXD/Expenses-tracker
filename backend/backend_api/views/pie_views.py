from rest_framework.decorators import api_view
from django.http import JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from django.db.models import Sum
from django.core.exceptions import ValidationError
from backend_api.views.utils import get_query_params, handle_error
from backend_api.models import Receipt
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
            name="month", description="Wybrany miesiąc", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Wybrany rok", required=True, type=int
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
        # Pobieramy wymagane parametry
        params = get_query_params(request, "month", "year")
        selected_month = params["month"]
        selected_year = params["year"]
        # print(
        #     "DEBUG: selected_month =", selected_month, "selected_year =", selected_year
        # )

        # Filtrujemy paragony o typie "expense" dla wybranego miesiąca i roku
        receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()
        # print("DEBUG: receipts count =", receipts.count())

        # Pobieramy parametr owners[] (lista właścicieli)
        owners_param = request.GET.getlist("owners[]")
        # print("DEBUG: owners_param =", owners_param)
        if owners_param:
            selected_owner_ids = [int(o) for o in owners_param]
            receipts = receipts.filter(
                items__owners__id__in=selected_owner_ids
            ).distinct()
            # print("DEBUG: receipts count after owners filter =", receipts.count())

        # Pobieramy przedmioty powiązane z wybranymi paragonami
        from backend_api.models import Item  # dostosuj import do swojej struktury

        item_qs = Item.objects.filter(receipts__in=receipts).distinct()
        # print("DEBUG: initial item_qs count =", item_qs.count())

        # Agregujemy wyniki w Pythonie – dla każdego przedmiotu:
        # fractional_value = value / (liczba właścicieli)
        category_totals = {}
        for item in item_qs:
            owners_count = item.owners.count()  # liczba właścicieli przedmiotu
            if owners_count > 0:
                fractional_value = float(item.value) / owners_count
            else:
                fractional_value = float(item.value)
            # Dodajemy do sumy dla danej kategorii
            cat = item.category
            category_totals[cat] = category_totals.get(cat, 0) + fractional_value

        # Przekształcamy słownik na listę słowników i sortujemy malejąco po sumie
        aggregated_data = [
            {
                "category": cat,
                "expense_sum": round(total, 2),
                "fill": f"var(--color-{cat})",
            }
            for cat, total in category_totals.items()
        ]
        aggregated_data.sort(key=lambda x: x["category"])
        # print("DEBUG: aggregated data =", aggregated_data)

        serializer = CategoryPieExpenseSerializer(data=aggregated_data, many=True)
        if serializer.is_valid():
            # print("DEBUG: serializer data =", serializer.data)
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            # print("DEBUG: serializer errors =", serializer.errors)
            return JsonResponse(serializer.errors, safe=False, status=400)
    except ValidationError as e:
        # print("DEBUG: ValidationError =", e)
        return handle_error(e, 400, "Invalid category")
    except Exception as e:
        # print("DEBUG: Exception =", e)
        return handle_error(e, 500, "Error while fetching pie categories")
