import datetime
import calendar
from collections import defaultdict
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db.models import Sum, Q, F
from django.http import JsonResponse
from django.utils.timezone import now

from django_filters.rest_framework import DjangoFilterBackend

from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiResponse,
)
from rest_framework import viewsets, generics, serializers
from rest_framework.decorators import api_view
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ItemFilter, ReceiptFilter
from .models import Person, Item, Receipt, RecentShop, ItemPrediction
from .serializers import (
    PersonSerializer,
    ItemSerializer,
    ReceiptSerializer,
    ItemPredictionSerializer,
    PersonExpenseSerializer,
    ShopExpenseSerializer,
    CategoryPieExpenseSerializer,
)


# Create your views here.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ItemFilter


class ReceiptListCreateView(generics.ListCreateAPIView):
    queryset = Receipt.objects.all().order_by("payment_date").distinct()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReceiptFilter

    def create(self, request, *args, **kwargs):
        serializer = ReceiptSerializer(
            data=request.data, many=isinstance(request.data, list)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ReceiptSerializer(queryset, many=True)
        return Response(serializer.data)


class ReceiptUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer


class RecentShopSearchView(APIView):
    def get(self, request, *args, **kwargs):
        query = request.GET.get("q", "").strip()
        if not query:
            shops = RecentShop.objects.all().order_by("name")
            results = [
                {"id": shop.id, "name": shop.name.capitalize()} for shop in shops
            ]
            return JsonResponse({"results": results})

        if len(query) < 3:
            return JsonResponse({"results": []})

        shops = RecentShop.objects.filter(name__icontains=query).order_by("-last_used")[
            :10
        ]
        results = [{"id": shop.id, "name": shop.name.capitalize()} for shop in shops]

        return JsonResponse({"results": results})

    @staticmethod
    def scan_and_update_shops(new_shops=None):
        receipt_shops = Receipt.objects.values_list("shop", flat=True)

        all_shops = set(shop.strip().lower() for shop in receipt_shops if shop)
        if new_shops:
            all_shops.update(shop.strip().lower() for shop in new_shops)

        print(sorted(list(all_shops)))

        for shop in all_shops:
            RecentShop.objects.update_or_create(
                name=shop, defaults={"last_used": now()}
            )

        return all_shops

    def post(self, request, *args, **kwargs):
        new_shops = request.data.get("new_shops", [])
        if not isinstance(new_shops, list):
            return JsonResponse(
                {"error": "Invalid data format. Provide a list."}, status=400
            )

        updated_shops = self.scan_and_update_shops(new_shops)

        return JsonResponse(
            {
                "message": "Shops updated successfully.",
                "updated_shops": list(updated_shops),
            }
        )

    def delete(self, request, *args, **kwargs):
        RecentShop.objects.all().delete()
        return JsonResponse({"message": "All recent shops have been deleted."})


class ItemPredictionSearchView(APIView):
    def get(self, request, *args, **kwargs):
        query = request.GET.get("q", "").strip().lower()

        # Retrieve predictions
        predictions = ItemPrediction.objects.all()

        # Filter by query if provided and valid
        if query:
            if len(query) < 3:
                return JsonResponse({"results": []})
            predictions = predictions.filter(item_description__icontains=query)

        # Group and sort predictions by frequency or alphabetically
        predictions = predictions.values("item_description", "frequency").order_by(
            "-frequency" if query else "item_description"
        )

        # Serialize results
        results = [
            {
                "name": prediction["item_description"].capitalize(),
                "frequency": prediction["frequency"],
            }
            for prediction in predictions
        ]
        return JsonResponse({"results": results})

    @staticmethod
    def scan_and_update_predictions():
        """
        Scan receipts and update ItemPrediction table with unique items.
        """
        receipts = Receipt.objects.prefetch_related("items").all()
        frequency_map = defaultdict(int)  # Track item frequency

        for receipt in receipts:
            for item in receipt.items.all():
                item_description = item.description.strip().lower()
                if not item_description:
                    continue  # Skip items with no description

                # Update frequency map
                frequency_map[item_description] += 1

        # Update database with frequency map
        for item_description, frequency in frequency_map.items():
            prediction, created = ItemPrediction.objects.get_or_create(
                item_description=item_description
            )
            if created:
                prediction.frequency = frequency
            else:
                prediction.frequency += frequency
            prediction.save()

        return "ItemPrediction table updated."

    def post(self, request, *args, **kwargs):
        """Manually scan receipts to update ItemPrediction."""
        result = self.scan_and_update_predictions()
        return JsonResponse({"message": result})

    def delete(self, request, *args, **kwargs):
        """Delete all data from ItemPrediction table."""
        ItemPrediction.objects.all().delete()
        return JsonResponse({"message": "All predictions have been deleted."})


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="month", description="Selected month", required=False, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=False, type=int
        ),
        OpenApiParameter(
            name="owners", description="Selected owners", required=False, type=list
        ),
    ],
    responses={200: {"total_income": 0.0, "total_expense": 0.0, "balance": 0.0}},
)
@api_view(["GET"])
def monthly_balance(request):
    # Get the month, year, and owner from the GET request
    month = request.GET.get("month")
    year = request.GET.get("year")
    owner_id = request.GET.get("owner")  # Assuming owner is an ID now

    # Check if owner_id is valid
    if owner_id == "-":
        return JsonResponse(data={"error": "Bad user selected"}, status=400)

    try:
        owner_id = int(owner_id)
    except ValueError:
        return JsonResponse(data={"error": "Invalid owner ID"}, status=400)

    # Set current date if month or year is not provided
    today = datetime.today()
    current_year = today.year
    current_month = today.month

    # Assign provided year and month or default values
    year = int(year) if year else current_year
    month = int(month) if month else current_month

    # Prepare filters
    income_filter = {
        "receipts__payment_date__year": year,
        "receipts__payment_date__month": month,
        "category__in": [
            "work_income",
            "family_income",
            "investments_income",
            "money_back",
        ],
    }

    expense_filter = {
        "receipts__payment_date__year": year,
        "receipts__payment_date__month": month,
        "category__in": [
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
            "for_study",
        ],
    }

    # Add owner filter if specified
    if owner_id:
        income_filter["owners"] = owner_id
        expense_filter["owners"] = owner_id

    # Calculate total income for the given month and year
    total_income = (
        Item.objects.filter(**income_filter).aggregate(total=Sum("value"))["total"] or 0
    )
    total_expense = (
        Item.objects.filter(**expense_filter).aggregate(total=Sum("value"))["total"]
        or 0
    )

    # Compute balance by subtracting total expenses from total income
    balance = total_income - total_expense

    # Return JSON response with total income, total expense, balance, year, month, and owner_id
    return JsonResponse(
        data={
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "year": year,
            "month": month,
            "owner": owner_id,
        },
        status=200,
    )


"""
    Function to fetch all dates in the selected month.

    @param selected_year Selected year.
    @param selected_month Selected month.

    @return List of all dates in the selected month.
"""


def get_all_dates_in_month(selected_year, selected_month):
    # Get the last day of the selected month
    _, last_day = calendar.monthrange(int(selected_year), int(selected_month))

    # Generate a list of all dates in the selected month
    all_dates = [
        f"{selected_year}-{selected_month:02d}-{day:02d}"
        for day in range(1, last_day + 1)
    ]

    return all_dates  # Get owner, month, and year from the GET request


"""
    Function to validate the selected category.
    It checks if the selected category is allowed.
    If the category is not allowed, it raises a ValidationError.

    @param selected_category Selected category to validate.

    @raises ValidationError if the selected category is not allowed.

    @return None
"""


def validate_category(selected_category):
    allowed_categories = [
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
        "no_fuel",
        "no_car_expenses",
        "no_fastfood",
        "no_alcohol",
        "no_food_drinks",
        "no_chemistry",
        "no_clothes",
        "no_electronics_games",
        "no_tickets_entrance",
        "no_delivery",
        "no_other_shopping",
        "no_flat_bills",
        "no_monthly_subscriptions",
        "no_other_cyclical_expenses",
        "no_investments_savings",
        "no_other",
        "no_category",
    ]

    if selected_category not in allowed_categories:
        raise ValidationError(f"Invalid category: {selected_category}")


"""
    Function to process receipts based on the selected category.
    It filters the receipts based on the selected category.
    If the selected category starts with "no_", it excludes items with that category.
    If the selected category is not "no_category", it filters items only to the selected category.
    If the selected category is "no_category", it returns all receipts.

    @param receipts Receipts queryset to process.
    @param selected_category Selected category to filter receipts.

    @return Filtered receipts based on the selected category.
"""


def process_receipts(receipts, selected_category):
    category_mapping = {
        "no_fuel": "fuel",
        "no_car_expenses": "car_expenses",
        "no_fastfood": "fastfood",
        "no_alcohol": "alcohol",
        "no_food_drinks": "food_drinks",
        "no_chemistry": "chemistry",
        "no_clothes": "clothes",
        "no_electronics_games": "electronics_games",
        "no_tickets_entrance": "tickets_entrance",
        "no_other_shopping": "other_shopping",
        "no_flat_bills": "flat_bills",
        "no_monthly_subscriptions": "monthly_subscriptions",
        "no_other_cyclical_expenses": "other_cyclical_expenses",
        "no_investments_savings": "investments_savings",
        "no_other": "other",
    }

    # Jeśli wybrano kategorię "no_", odfiltruj transakcje z tą kategorią
    if selected_category.startswith("no_"):
        category_to_exclude = category_mapping.get(selected_category)
        return receipts.exclude(items__category=category_to_exclude)

    # Filtruj transakcje tylko do wybranej kategorii
    if selected_category != "no_category":
        return receipts.filter(items__category=selected_category)

    return receipts


def get_query_params(request, *params):
    """Helper function to get and validate query parameters."""
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
    """Helper function to handle errors."""
    return JsonResponse({"error": str(exception) + " " + context}, status=status_code)


def process_items(receipts):
    """Helper function to process items and compute daily sums."""
    daily_sums = {}
    for receipt in receipts:
        for item in receipt.items.all():
            date = str(receipt.payment_date)
            value = float(item.value)
            daily_sums[date] = daily_sums.get(date, 0) + value
    return daily_sums


def convert_sum_to_linear(daily_sums, all_dates):
    """Convert daily sums to cumulative linear sums."""
    linear_sum = []
    current_sum = 0
    for date in all_dates:
        current_sum += daily_sums.get(date, 0)
        linear_sum.append(current_sum)
    return linear_sum


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owner", description="Selected owner ID", required=False, type=int
        ),
        OpenApiParameter(
            name="month", description="Selected month", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
        ),
    ],
    responses={200: {"linearExpenseSums": [0.0], "linearIncomeSums": [0.0]}},
)
@api_view(["GET"])
def fetch_line_sums(request):
    try:
        params = get_query_params(request, "month", "year")
        selected_owner_id = request.GET.get("owner")
        selected_month = params["month"]
        selected_year = params["year"]
    except ValueError as e:
        return handle_error(e, 400, "Invalid query parameters")

    try:
        expense_receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

        income_receipts = Receipt.objects.filter(
            transaction_type="income",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

        if selected_owner_id:
            expense_receipts = expense_receipts.filter(items__owner=selected_owner_id)
            income_receipts = income_receipts.filter(items__owner=selected_owner_id)

        all_dates = get_all_dates_in_month(selected_year, selected_month)
        daily_expense_sums = process_items(expense_receipts)
        daily_income_sums = process_items(income_receipts)

        linear_expense_sums = convert_sum_to_linear(daily_expense_sums, all_dates)
        linear_income_sums = convert_sum_to_linear(daily_income_sums, all_dates)

        return JsonResponse(
            {
                "linearExpenseSums": linear_expense_sums,
                "linearIncomeSums": linear_income_sums,
            },
            status=200,
        )

    except Exception as e:
        return handle_error(e, 500, "Error while processing data")


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
            name="category",
            description="Selected category",
            required=False,
            type=list,
        ),
    ],
    responses={
        200: PersonExpenseSerializer(many=True),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@api_view(["GET"])
def fetch_bar_persons(request):
    try:
        # Pobranie parametrów zapytania
        selected_month = int(request.GET.get("month"))
        selected_year = int(request.GET.get("year"))
        selected_categories = request.GET.getlist("category")

    except (ValueError, TypeError):
        return JsonResponse({"error": "Invalid query parameters"}, status=400)

    try:
        # Pobranie paragonów
        receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).prefetch_related("items")

        # Słowniki dla dwóch rodzajów wydatków
        shared_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set()}
        )
        not_own_expense_sums = defaultdict(
            lambda: {"sum": Decimal(0), "receipt_ids": set()}
        )

        for receipt in receipts:
            payer = receipt.payer
            for item in receipt.items.all():
                owners = list(item.owners.all())  # Pobranie listy właścicieli

                # Jeśli filtr kategorii, pomiń przedmioty spoza wybranych kategorii
                if selected_categories and item.category not in selected_categories:
                    continue

                # Jeśli płatnik zapłacił za rzecz, którą współdzieli z innymi (min. 2 właścicieli i wśród nich payer)
                if len(owners) > 1 and payer in owners:
                    try:
                        shared_expense_sums[payer]["sum"] += Decimal(item.value)
                        shared_expense_sums[payer]["receipt_ids"].add(receipt.id)
                    except (ValueError, TypeError):
                        continue

                # Jeśli płatnik zapłacił za rzecz, której nie jest właścicielem
                if payer not in owners:
                    try:
                        not_own_expense_sums[payer]["sum"] += Decimal(item.value)
                        not_own_expense_sums[payer]["receipt_ids"].add(receipt.id)
                    except (ValueError, TypeError):
                        continue

        # Sortowanie wyników
        sorted_shared_expenses = sorted(
            shared_expense_sums.items(), key=lambda x: x[1]["sum"], reverse=True
        )
        sorted_not_own_expenses = sorted(
            not_own_expense_sums.items(), key=lambda x: x[1]["sum"], reverse=True
        )

        # Przygotowanie odpowiedzi
        response_data = {
            "shared_expenses": [
                {
                    "payer": payer.id,
                    "expense_sum": float(data["sum"]),
                    "receipt_ids": list(data["receipt_ids"]),  # Konwersja set na listę
                }
                for payer, data in sorted_shared_expenses
            ],
            "not_own_expenses": [
                {
                    "payer": payer.id,
                    "expense_sum": float(data["sum"]),
                    "receipt_ids": list(data["receipt_ids"]),  # Konwersja set na listę
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
            name="owner", description="Selected owner ID", required=False, type=int
        ),
        OpenApiParameter(
            name="month", description="Selected month", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
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
        selected_owner = int(
            request.GET.get("owner", 0)
        )  # 0, jeśli owner nie jest podany
        selected_month = int(params["month"])
        selected_year = int(params["year"])
    except ValueError as e:
        return handle_error(e, 400, "Invalid query parameters")

    try:
        # Wyciągnięcie wszystkich paragonów typu "expense" z powiązanymi pozycjami (items)
        receipts = (
            Receipt.objects.prefetch_related("items")
            .filter(transaction_type="expense")
            .all()
        )

        # Przykładowe kategorie, które nas interesują
        categories = [
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

        # Słownik przechowujący sumy wydatków dla sklepów
        expense_sums_by_shop = defaultdict(float)

        # Filtrowanie i sumowanie ręczne w Pythonie
        for receipt in receipts:
            # Konwersja daty płatności na obiekt datetime
            payment_date = receipt.payment_date
            if (
                payment_date.year == selected_year
                and payment_date.month == selected_month
            ):
                # Przetwarzanie tylko tych paragonów, które spełniają kryterium daty
                for item in receipt.items.all():
                    # Sprawdzenie kategorii i właściciela (jeśli został wybrany)
                    if item.category in categories and (
                        not selected_owner or item.owner == selected_owner
                    ):
                        try:
                            # Dodajemy wartość do odpowiedniego sklepu
                            value = float(item.value)
                            expense_sums_by_shop[receipt.shop] += value
                        except ValueError:
                            # Jeśli wartość nie może być przekonwertowana na float, pomijamy ten wpis
                            continue

        # Sortowanie wyników według sumy wydatków (malejąco)
        sorted_expense_sums = sorted(
            expense_sums_by_shop.items(), key=lambda x: x[1], reverse=True
        )

        # Serializacja danych (zakładam, że ShopExpenseSerializer działa dla listy słowników)
        serialized_data = [
            {"shop": shop, "expense_sum": total} for shop, total in sorted_expense_sums
        ]
        serializer = ShopExpenseSerializer(data=serialized_data, many=True)

        if serializer.is_valid():
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)

    except Exception as e:
        return handle_error(e, 500, "Error while fetching bar shops")


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owner", description="Selected owner ID", required=False, type=str
        ),
        OpenApiParameter(
            name="month", description="Selected month", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
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
        selected_owner = request.GET.get("owner")
        params = get_query_params(request, "month", "year")
        selected_month = params["month"]
        selected_year = params["year"]

        receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

        if selected_owner and selected_owner != 99:
            receipts = receipts.filter(items__owner=selected_owner)

        category_expense_sums = (
            receipts.values("items__category")
            .annotate(expense_sum=Sum("items__value"))
            .order_by("-expense_sum")
        )

        serializer = CategoryPieExpenseSerializer(
            data=list(category_expense_sums), many=True
        )

        if serializer.is_valid():
            return JsonResponse(serializer.data, safe=False, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)

    except ValidationError as e:
        return handle_error(e, 400, "Invalid category")
    except Exception as e:
        return handle_error(e, 500, "Error while fetching pie categories")


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="month", description="Selected month", required=True, type=int
        ),
        OpenApiParameter(
            name="year", description="Selected year", required=True, type=int
        ),
    ],
    responses={
        200: ReceiptSerializer(many=True),
        400: OpenApiResponse(description="Bad request"),
    },
)
@api_view(["GET"])
def bills(request):
    ## Return all bills for the selected month and year
    try:
        selected_month = request.GET.get("month")
        selected_year = request.GET.get("year")

        receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
            items__category="flat_bills",
        ).distinct()

        serializer = ReceiptSerializer(receipts, many=True)

        return JsonResponse(serializer.data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
