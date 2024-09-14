# import calendar
# from datetime import datetime

# from django.db.models import Sum
# from django.http import JsonResponse
# from django_filters.rest_framework import DjangoFilterBackend

# from drf_spectacular.utils import (
#     extend_schema,
#     OpenApiParameter,
#     OpenApiResponse,
# )

# from rest_framework import viewsets, generics

# from rest_framework.response import Response
# from rest_framework import serializers, status
# from rest_framework.decorators import api_view
# from rest_framework.exceptions import ValidationError

# from .models import User, Groups, Transaction, Receipt
# from .serializers import (
#     UserSerializer,
#     GroupsSerializer,
#     TransactionSerializer,
#     ReceiptSerializer,
#     PersonExpenseSerializer,
#     ShopExpenseSerializer,
#     CategoryPieExpenseSerializer,
# )
# from .filters import TransactionFilter, ReceiptFilter


# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, many=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             serializer.data, status=status.HTTP_201_CREATED, headers=headers
#         )


# class GroupsViewSet(viewsets.ModelViewSet):
#     queryset = Groups.objects.all()
#     serializer_class = GroupsSerializer

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, many=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             serializer.data, status=status.HTTP_201_CREATED, headers=headers
#         )


# class TransactionViewSet(viewsets.ModelViewSet):
#     queryset = Transaction.objects.all()
#     serializer_class = TransactionSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = TransactionFilter

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, many=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             serializer.data, status=status.HTTP_201_CREATED, headers=headers
#         )


# class ReceiptViewSet(viewsets.ModelViewSet):
#     queryset = Receipt.objects.all().distinct()
#     serializer_class = ReceiptSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = ReceiptFilter

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, many=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             serializer.data, status=status.HTTP_201_CREATED, headers=headers
#         )


# @extend_schema(
#     methods=["POST"],
#     request=ReceiptSerializer,
#     responses={201: ReceiptSerializer},
# )
# @api_view(["POST"])
# def import_database(request):
#     try:
#         data = request.data

#         # Walidacja formatu danych
#         if not isinstance(data, list):
#             return JsonResponse(
#                 {"error": "Data is not in the correct format"}, status=400
#             )

#         receipts_data = data

#         # Pobranie ID istniejących rekordów
#         existing_receipt_ids = set(Receipt.objects.values_list("id", flat=True))
#         existing_transaction_ids = set(Transaction.objects.values_list("id", flat=True))

#         # Przetworzenie danych
#         new_receipts = []
#         new_transactions = []

#         for receipt_data in receipts_data:
#             receipt_id = receipt_data.get("id")
#             if receipt_id in existing_receipt_ids:
#                 # Jeżeli paragon już istnieje, pominąć go
#                 continue

#             # Przetwarzanie transakcji
#             transactions_data = receipt_data.get("transactions", [])
#             transactions_objects = []
#             for transaction_data in transactions_data:
#                 transaction_id = transaction_data.get("id")
#                 if transaction_id in existing_transaction_ids:
#                     # Jeżeli transakcja już istnieje, pominąć ją
#                     continue

#                 # Walidacja i zapis nowej transakcji
#                 serializer = TransactionSerializer(data=transaction_data)
#                 if serializer.is_valid():
#                     transaction = serializer.save()
#                     transactions_objects.append(transaction)
#                 else:
#                     return JsonResponse(
#                         {"error": f"Invalid transaction data: {serializer.errors}"},
#                         status=400,
#                     )

#             # Walidacja i zapis nowego paragonu
#             receipt_data["transactions"] = [t.id for t in transactions_objects]
#             serializer = ReceiptSerializer(data=receipt_data)
#             if serializer.is_valid():
#                 receipt = serializer.save()
#             else:
#                 return JsonResponse(
#                     {"error": f"Invalid receipt data: {serializer.errors}"}, status=400
#                 )

#             new_receipts.append(receipt)
#             new_transactions.extend(transactions_objects)

#         return JsonResponse(
#             data={
#                 "message": "Data imported successfully",
#                 "new_receipts_count": len(new_receipts),
#                 "new_transactions_count": len(new_transactions),
#             },
#             status=201,
#         )
#     except Exception as e:
#         return JsonResponse({"error": f"Exception. {str(e)}"}, status=500)
#     except serializers.ValidationError as e:
#         return JsonResponse({"error": f"Serializer error. {str(e)}"}, status=400)


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="month", description="Selected month", required=False, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=False, type=int
#         ),
#         OpenApiParameter(
#             name="owner", description="Selected owner", required=False, type=int
#         ),
#     ],
#     responses={200: {"total_income": 0.0, "total_expense": 0.0, "balance": 0.0}},
# )
# @api_view(["GET"])
# def monthly_balance(request):
#     # Get the month, year, and owner from the GET request
#     month = request.GET.get("month")
#     year = request.GET.get("year")
#     owner_id = request.GET.get("owner")  # Assuming owner is an ID now

#     # Check if owner_id is valid
#     if owner_id == "-":
#         return JsonResponse(data={"error": "Bad user selected"}, status=400)

#     try:
#         owner_id = int(owner_id)
#     except ValueError:
#         return JsonResponse(data={"error": "Invalid owner ID"}, status=400)

#     # Set current date if month or year is not provided
#     today = datetime.today()
#     current_year = today.year
#     current_month = today.month

#     # Assign provided year and month or default values
#     year = int(year) if year else current_year
#     month = int(month) if month else current_month

#     # Prepare filters
#     income_filter = {
#         "receipts__payment_date__year": year,
#         "receipts__payment_date__month": month,
#         "category__in": [
#             "work_income",
#             "family_income",
#             "investments_income",
#             "money_back",
#         ],
#     }

#     expense_filter = {
#         "receipts__payment_date__year": year,
#         "receipts__payment_date__month": month,
#         "category__in": [
#             "fuel",
#             "car_expenses",
#             "fastfood",
#             "alcohol",
#             "food_drinks",
#             "chemistry",
#             "clothes",
#             "electronics_games",
#             "tickets_entrance",
#             "other_shopping",
#             "flat_bills",
#             "monthly_subscriptions",
#             "other_cyclical_expenses",
#             "investments_savings",
#             "other",
#             "for_study",
#         ],
#     }

#     # Add owner filter if specified
#     if owner_id:
#         income_filter["owners"] = owner_id
#         expense_filter["owners"] = owner_id

#     # Calculate total income for the given month and year
#     total_income = (
#         Transaction.objects.filter(**income_filter).aggregate(total=Sum("value"))[
#             "total"
#         ]
#         or 0
#     )
#     total_expense = (
#         Transaction.objects.filter(**expense_filter).aggregate(total=Sum("value"))[
#             "total"
#         ]
#         or 0
#     )

#     # Compute balance by subtracting total expenses from total income
#     balance = total_income - total_expense

#     # Return JSON response with total income, total expense, balance, year, month, and owner_id
#     return JsonResponse(
#         data={
#             "total_income": total_income,
#             "total_expense": total_expense,
#             "balance": balance,
#             "year": year,
#             "month": month,
#             "owner": owner_id,
#         },
#         status=200,
#     )


# """
#     Function to fetch all dates in the selected month.

#     @param selected_year Selected year.
#     @param selected_month Selected month.

#     @return List of all dates in the selected month.
# """


# def get_all_dates_in_month(selected_year, selected_month):
#     # Get the last day of the selected month
#     _, last_day = calendar.monthrange(int(selected_year), int(selected_month))

#     # Generate a list of all dates in the selected month
#     all_dates = [
#         f"{selected_year}-{selected_month:02d}-{day:02d}"
#         for day in range(1, last_day + 1)
#     ]

#     return all_dates


# """
#     Function to fetch cumulative sums of expenses and incomes for a given owner, month, and year.
#     It fetches all expense and income receipts for the given owner, month, and year.
#     It processes the transactions by date and computes daily sums.
#     It converts daily sums to cumulative linear sums for expenses and incomes.

#     @param request GET request with owner, month, and year parameters.

#     @return JSON response with cumulative sums for expenses and incomes.
# """


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="owner", description="Selected owner ID", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="month", description="Selected month", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=True, type=int
#         ),
#     ],
#     responses={200: {"linearExpenseSums": [0.0], "linearIncomeSums": [0.0]}},
# )
# @api_view(["GET"])
# def fetch_line_sums(request):
#     # Get owner, month, and year from the GET request
#     selected_owner_id = request.GET.get("owner")
#     selected_month = int(request.GET.get("month"))
#     selected_year = int(request.GET.get("year"))

#     # Validate owner_id
#     try:
#         selected_owner_id = int(selected_owner_id)
#     except (TypeError, ValueError):
#         return JsonResponse(data={"error": "Invalid owner ID"}, status=400)

#     try:
#         # Fetch all expense receipts for the given owner, month, and year
#         expense_receipts = Receipt.objects.filter(
#             transactions__owners=selected_owner_id,
#             transaction_type="expense",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#         ).distinct()

#         # Fetch all income receipts for the given owner, month, and year
#         income_receipts = Receipt.objects.filter(
#             transactions__owners=selected_owner_id,
#             transaction_type="income",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#         ).distinct()
#     except Exception as e:
#         return JsonResponse(
#             data={"error": f"Error fetching receipts: {str(e)}"}, status=500
#         )

#     try:
#         # Process the transactions by date and compute daily sums
#         def process_transactions(receipts):
#             daily_sums = {}
#             for receipt in receipts:
#                 for transaction in receipt.transactions.all():
#                     date = str(receipt.payment_date)  # Format the date
#                     value = float(transaction.value)
#                     if date in daily_sums:
#                         daily_sums[date] += value
#                     else:
#                         daily_sums[date] = value
#             return daily_sums

#         # Process expense and income transactions
#         daily_expense_sums = process_transactions(expense_receipts)
#         daily_income_sums = process_transactions(income_receipts)

#         # Convert daily sums to cumulative linear sums
#         def convert_sum_to_linear(daily_sums, all_dates):
#             linear_sum = []
#             current_sum = 0
#             for date in all_dates:
#                 current_sum += daily_sums.get(date, 0)
#                 linear_sum.append(current_sum)
#             return linear_sum

#         # All dates in month from selected year and month
#         all_dates = get_all_dates_in_month(selected_year, selected_month)

#         # Convert daily sums to linear cumulative sums for expenses and incomes
#         linear_expense_sums = convert_sum_to_linear(daily_expense_sums, all_dates)
#         linear_income_sums = convert_sum_to_linear(daily_income_sums, all_dates)

#         # Return JSON response with cumulative sums for expenses and incomes
#         return JsonResponse(
#             data={
#                 "linearExpenseSums": linear_expense_sums,
#                 "linearIncomeSums": linear_income_sums,
#             },
#             status=200,
#         )

#     except Exception as e:
#         return JsonResponse(
#             data={"error": f"Error processing data: {str(e)}"}, status=500
#         )


# """
#     Function to validate the selected category.
#     It checks if the selected category is allowed.
#     If the category is not allowed, it raises a ValidationError.

#     @param selected_category Selected category to validate.

#     @raises ValidationError if the selected category is not allowed.

#     @return None
# """


# def validate_category(selected_category):
#     allowed_categories = [
#         "fuel",
#         "car_expenses",
#         "fastfood",
#         "alcohol",
#         "food_drinks",
#         "chemistry",
#         "clothes",
#         "electronics_games",
#         "tickets_entrance",
#         "other_shopping",
#         "flat_bills",
#         "monthly_subscriptions",
#         "other_cyclical_expenses",
#         "investments_savings",
#         "other",
#         "no_fuel",
#         "no_car_expenses",
#         "no_fastfood",
#         "no_alcohol",
#         "no_food_drinks",
#         "no_chemistry",
#         "no_clothes",
#         "no_electronics_games",
#         "no_tickets_entrance",
#         "no_other_shopping",
#         "no_flat_bills",
#         "no_monthly_subscriptions",
#         "no_other_cyclical_expenses",
#         "no_investments_savings",
#         "no_other",
#         "no_category",
#     ]

#     if selected_category not in allowed_categories:
#         raise ValidationError(f"Invalid category: {selected_category}")


# """
#     Function to process receipts based on the selected category.
#     It filters the receipts based on the selected category.
#     If the selected category starts with "no_", it excludes transactions with that category.
#     If the selected category is not "no_category", it filters transactions only to the selected category.
#     If the selected category is "no_category", it returns all receipts.

#     @param receipts Receipts queryset to process.
#     @param selected_category Selected category to filter receipts.

#     @return Filtered receipts based on the selected category.
# """


# def process_receipts(receipts, selected_category):
#     category_mapping = {
#         "no_fuel": "fuel",
#         "no_car_expenses": "car_expenses",
#         "no_fastfood": "fastfood",
#         "no_alcohol": "alcohol",
#         "no_food_drinks": "food_drinks",
#         "no_chemistry": "chemistry",
#         "no_clothes": "clothes",
#         "no_electronics_games": "electronics_games",
#         "no_tickets_entrance": "tickets_entrance",
#         "no_other_shopping": "other_shopping",
#         "no_flat_bills": "flat_bills",
#         "no_monthly_subscriptions": "monthly_subscriptions",
#         "no_other_cyclical_expenses": "other_cyclical_expenses",
#         "no_investments_savings": "investments_savings",
#         "no_other": "other",
#     }

#     # Jeśli wybrano kategorię "no_", odfiltruj transakcje z tą kategorią
#     if selected_category.startswith("no_"):
#         category_to_exclude = category_mapping.get(selected_category)
#         return receipts.exclude(transactions__category=category_to_exclude)

#     # Filtruj transakcje tylko do wybranej kategorii
#     if selected_category != "no_category":
#         return receipts.filter(transactions__category=selected_category)

#     return receipts


# """
#     Function to fetch cumulative sums of expenses for each category.
#     It fetches all expense receipts for the selected month and year.
#     It computes the sum of expenses for each category.

#     @param request GET request with month and year parameters.

#     @return JSON response with cumulative sums for each category dividet by payer.
# """


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="month", description="Selected month", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="category",
#             description="Selected categories array",
#             required=False,
#             type=list,
#         ),
#     ],
#     responses={
#         200: PersonExpenseSerializer(many=True),
#         400: OpenApiResponse(description="Bad request"),
#         500: OpenApiResponse(description="Internal server error"),
#     },
# )
# @api_view(["GET"])
# def fetch_bar_persons(request):
#     try:
#         # Odbieramy miesiąc i rok z zapytania GET
#         selected_month = int(request.GET.get("month"))
#         selected_year = int(request.GET.get("year"))

#         # Odbieramy listę kategorii (może być pusta, co oznacza wszystkie kategorie)
#         selected_categories = request.GET.getlist("category")

#         print(f"Received categories: {selected_categories}")

#     except Exception as e:
#         return JsonResponse({"Request error": str(e)}, status=400)

#     try:
#         # Jeśli nie podano kategorii, traktujemy to jako wybór wszystkich kategorii
#         if not selected_categories:  # Jeśli pusta lista
#             print("No categories selected, fetching all categories.")
#         else:
#             # Walidacja każdej kategorii
#             for category in selected_categories:
#                 validate_category(category)

#     except Exception as e:
#         return JsonResponse({"Category error": str(e)}, status=400)

#     try:

#         # Pobierz transakcje według miesiąca i roku
#         receipts = Receipt.objects.filter(
#             transaction_type="expense",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#         ).distinct()

#     except Exception as e:
#         return JsonResponse({"Receipt error": str(e)}, status=500)

#     try:
#         # Filtrowanie według kategorii (jeśli kategorie są podane)
#         if selected_categories:
#             receipts = receipts.filter(
#                 transactions__category__in=selected_categories,
#             )

#         receipts = receipts.filter(
#             transactions__owner="common",
#         )

#         print(f"Receipts {receipts}")
#         # Sumowanie wydatków per osoba
#         persons_expense_sums = (
#             receipts.values("payer")
#             .annotate(expense_sum=Sum("transactions__value"))
#             .order_by("-expense_sum")
#         )

#         # Konwertujemy QuerySet na listę przed przekazaniem do serializatora
#         persons_expense_sums_list = list(persons_expense_sums)
#     except Exception as e:
#         return JsonResponse({"Persons expense error": str(e)}, status=500)

#     try:
#         # Używamy serializatora, aby przekazać dane w odpowiedniej formie
#         serializer = PersonExpenseSerializer(data=persons_expense_sums_list, many=True)

#     except Exception as e:
#         return JsonResponse({"Serializer error": str(e)}, status=500)

#     try:

#         if serializer.is_valid():
#             return JsonResponse(serializer.data, status=200)
#         else:
#             return JsonResponse(serializer.errors, status=400)

#     except ValidationError as e:
#         return JsonResponse({"Response error": str(e)}, status=400)
#     except Exception as e:
#         return JsonResponse({"Response error": str(e)}, status=500)


# """
#     Function to fetch cumulative sums of expenses for each shop.
#     It fetches all expense receipts for the selected month and year.
#     It computes the sum of expenses for each shop.

#     @param request GET request with owner, month, and year parameters.

#     @return JSON response with cumulative sums for each shop.
# """


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="month", description="Selected month", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="category",
#             description="Selected categories array",
#             required=False,
#             type=list,
#         ),
#     ],
#     responses={
#         200: PersonExpenseSerializer(many=True),
#         400: OpenApiResponse(description="Bad request"),
#         500: OpenApiResponse(description="Internal server error"),
#     },
# )
# @api_view(["GET"])
# def fetch_bar_shops(request):
#     try:
#         # Get month, year, and categories from GET request
#         selected_month = int(request.GET.get("month"))
#         selected_year = int(request.GET.get("year"))
#         selected_categories = request.GET.getlist("category")

#         print(f"Received categories: {selected_categories}")

#         # Validate each category
#         if selected_categories:
#             for category in selected_categories:
#                 validate_category(category)

#     except Exception as e:
#         return JsonResponse({"error": f"Request error: {str(e)}"}, status=400)

#     try:
#         # Fetch receipts for the given month and year
#         receipts = Receipt.objects.filter(
#             transaction_type="expense",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#         ).distinct()

#         # Filter by categories if provided
#         if selected_categories:
#             receipts = receipts.filter(transactions__category__in=selected_categories)

#         # Aggregate expenses by payer (assuming 'payer' is user_id or similar)
#         persons_expense_sums = (
#             receipts.values("payer")
#             .annotate(expense_sum=Sum("transactions__value"))
#             .order_by("-expense_sum")
#         )

#         # Convert queryset to list for serialization
#         persons_expense_sums_list = list(persons_expense_sums)

#     except Exception as e:
#         return JsonResponse({"error": f"Data processing error: {str(e)}"}, status=500)

#     try:
#         # Serialize the data
#         serializer = PersonExpenseSerializer(data=persons_expense_sums_list, many=True)

#         if serializer.is_valid():
#             return JsonResponse(serializer.data, status=200)
#         else:
#             return JsonResponse({"error": serializer.errors}, status=400)

#     except Exception as e:
#         return JsonResponse({"error": f"Serializer error: {str(e)}"}, status=500)


# """
#     Function to fetch cumulative sums of expenses for each category.
#     It fetches all expense receipts for the selected month and year.
#     It computes the sum of expenses for each category.

#     @param request GET request with owner, month, and year parameters.

#     @return JSON response with cumulative sums for each category.
# """


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="owner", description="Selected owner ID", required=False, type=str
#         ),
#         OpenApiParameter(
#             name="month", description="Selected month", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=True, type=int
#         ),
#     ],
#     responses={
#         200: CategoryPieExpenseSerializer(many=True),
#         400: OpenApiResponse(description="Bad request"),
#         500: OpenApiResponse(description="Internal server error"),
#     },
# )
# @api_view(["GET"])
# def fetch_pie_categories(request):
#     try:
#         selected_owner = request.GET.get("owner")
#         selected_month = int(request.GET.get("month"))
#         selected_year = int(request.GET.get("year"))

#     except Exception as e:
#         return JsonResponse({"error": f"Request error: {str(e)}"}, status=400)

#     try:
#         # Fetch receipts based on month and year
#         receipts = Receipt.objects.filter(
#             transaction_type="expense",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#         ).distinct()

#         # Filter by owner if provided
#         if selected_owner:
#             if selected_owner != "common":
#                 receipts = receipts.filter(transactions__owner=selected_owner)

#         # Aggregate expenses by category
#         category_expense_sums = (
#             receipts.values("transactions__category")
#             .annotate(expense_sum=Sum("transactions__value"))
#             .order_by("-expense_sum")
#         )

#     except Exception as e:
#         return JsonResponse({"error": f"Data processing error: {str(e)}"}, status=500)

#     try:
#         # Convert to list for serialization
#         category_expense_sums_list = list(category_expense_sums)

#         # Serialize the data
#         serializer = CategoryPieExpenseSerializer(
#             data=category_expense_sums_list, many=True
#         )

#         if serializer.is_valid():
#             return JsonResponse(serializer.data, status=200)
#         else:
#             return JsonResponse({"error": serializer.errors}, status=400)

#     except ValidationError as e:
#         return JsonResponse({"error": f"Validation error: {str(e)}"}, status=400)
#     except Exception as e:
#         return JsonResponse({"error": f"Response error: {str(e)}"}, status=500)


# @extend_schema(
#     methods=["GET"],
#     parameters=[
#         OpenApiParameter(
#             name="month", description="Selected month", required=True, type=int
#         ),
#         OpenApiParameter(
#             name="year", description="Selected year", required=True, type=int
#         ),
#     ],
#     responses={
#         200: CategoryPieExpenseSerializer(many=True),
#         400: OpenApiResponse(description="Bad request"),
#     },
# )
# @api_view(["GET"])
# def bills(request):
#     ## Return all bills for the selected month and year
#     try:
#         selected_month = request.GET.get("month")
#         selected_year = request.GET.get("year")

#         receipts = Receipt.objects.filter(
#             transaction_type="expense",
#             payment_date__month=selected_month,
#             payment_date__year=selected_year,
#             transactions__category="flat_bills",
#         ).distinct()

#         serializer = ReceiptSerializer(receipts, many=True)

#         return JsonResponse(serializer.data, status=200)

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)
