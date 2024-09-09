import calendar
from datetime import datetime

from django.db.models import Sum
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Transaction, Receipt
from .serializers import TransactionSerializer, ReceiptSerializer
from .filters import TransactionFilter, ReceiptFilter


class TransactionView(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransactionFilter


class ReceiptCreateView(generics.CreateAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer


class ReceiptView(viewsets.ModelViewSet):
    queryset = Receipt.objects.all().distinct()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReceiptFilter


## monthly_balance(request)
#  Function to calculate the monthly balance based on transactions.
#  It processes the monthly income and expenses and computes the balance for the provided month, year, and owner.
#
#  @param request Django request object, which contains GET parameters: 'month', 'year', and 'owner'.
#  @return Response JSON response with total income, total expenses, and balance for the selected month and year.
@api_view(["GET"])
def monthly_balance(request):
    ## Get the month, year, and owner from the GET request
    month = request.GET.get("month")
    year = request.GET.get("year")
    owner = request.GET.get("owner")

    # Check if owner parameter is invalid
    if owner == "-":
        return JsonResponse(data={"error": "Bad user selected"}, status=400)

    ## Set current date if month or year is not provided
    today = datetime.today()
    current_year = today.year
    current_month = today.month

    ## Assign provided year and month or default values
    year = int(year) if year else current_year
    month = int(month) if month else current_month

    ## Check and assign valid owner, or set it to None
    if owner not in ["kamil", "ania", "common"]:
        owner = None

    ## Filters for income transactions based on category, year, and month
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

    ## Filters for expense transactions based on category, year, and month
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
    if owner:
        income_filter["owner"] = owner
        expense_filter["owner"] = owner

    ## Calculate total income for the given month and year
    total_income = (
        Transaction.objects.filter(**income_filter).aggregate(total=Sum("value"))[
            "total"
        ]
        or 0
    )

    ## Calculate total expenses for the given month and year
    total_expense = (
        Transaction.objects.filter(**expense_filter).aggregate(total=Sum("value"))[
            "total"
        ]
        or 0
    )

    ## Compute balance by subtracting total expenses from total income
    balance = total_income - total_expense

    ## Return JSON response with total income, total expense, balance, year, month, and owner
    return JsonResponse(
        data={
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "year": year,
            "month": month,
            "owner": owner,
        },
        status=200,
    )


# Get all dates in the selected month and year
def get_all_dates_in_month(selected_year, selected_month):
    # Get the last day of the selected month
    _, last_day = calendar.monthrange(int(selected_year), int(selected_month))

    # Generate a list of all dates in the selected month
    all_dates = [
        f"{selected_year}-{selected_month:02d}-{day:02d}"
        for day in range(1, last_day + 1)
    ]

    return all_dates


## fetch_monthly_transactions(request)
#  Function to fetch and process daily expenses and incomes for a given owner, month, and year.
#  It computes cumulative daily transaction sums for income and expenses.
#
#  @param request Django request object, which contains GET parameters: 'owner', 'month', and 'year', and 'all_dates'.
#  @return Response JSON response with cumulative daily sums for expenses and incomes.
@api_view(["GET"])
def fetch_monthly_transactions(request):
    ## Get owner, month, and year from the GET request
    selected_owner = request.GET.get("owner")
    selected_month = int(request.GET.get("month"))
    selected_year = int(request.GET.get("year"))

    try:
        ## Fetch all expense receipts for the given owner, month, and year
        expense_receipts = Receipt.objects.filter(
            transactions__owner=selected_owner,
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

        ## Fetch all income receipts for the given owner, month, and year
        income_receipts = Receipt.objects.filter(
            transactions__owner=selected_owner,
            transaction_type="income",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

    except Exception as e:
        ## Return error message if an exception occurs
        return JsonResponse(
            data={"error": str(e) + "expense/income receipts"}, status=500
        )

    try:
        ## Process the transactions by date and compute daily sums.
        #  @param receipts Receipts queryset to process.
        #  @return Dictionary mapping dates to sum of transaction values.
        def process_transactions(receipts):
            daily_sums = {}
            for receipt in receipts:
                for transaction in receipt.transactions.all():
                    date = str(receipt.payment_date)  # Format the date
                    value = float(transaction.value)
                    if date in daily_sums:
                        daily_sums[date] += value
                    else:
                        daily_sums[date] = value
            return daily_sums

        ## Process expense and income transactions
        daily_expense_sums = process_transactions(expense_receipts)
        daily_income_sums = process_transactions(income_receipts)

        ## Convert daily sums to cumulative linear sums.
        #  @param daily_sums Dictionary mapping dates to transaction values.
        #  @param all_dates List of dates for linear conversion.
        #  @return List of cumulative sums.
        def convert_sum_to_linear(daily_sums, all_dates):
            linear_sum = []
            current_sum = 0
            for date in all_dates:
                current_sum += daily_sums.get(date, 0)
                linear_sum.append(current_sum)
            return linear_sum

        ## All dates in month from selected year and month
        all_dates = get_all_dates_in_month(selected_year, selected_month)

        ## Convert daily sums to linear cumulative sums for expenses and incomes
        linear_expense_sums = convert_sum_to_linear(daily_expense_sums, all_dates)
        linear_income_sums = convert_sum_to_linear(daily_income_sums, all_dates)

        ## Return JSON response with cumulative sums for expenses and incomes
        return JsonResponse(
            data={
                "linearExpenseSums": linear_expense_sums,
                "linearIncomeSums": linear_income_sums,
            },
            status=200,
        )

    except Exception as e:
        ## Return error message if an exception occurs
        return JsonResponse(data={"error": str(e)}, status=500)


@api_view(["POST"])
def import_database(request):
    data = request.data
    receipts = data.get("receipts", [])
    transactions = data.get("transactions", [])

    # Sprawdzenie czy dane są w poprawnym formacie
    if not isinstance(receipts, list) or not isinstance(transactions, list):
        return JsonResponse(
            data={"error": "Data is not in the correct format"}, status=400
        )

    # Usunięcie duplikatów z przesłanych danych (na poziomie danych, nie bazy danych)
    receipts = list({receipt["receipt_id"]: receipt for receipt in receipts}.values())
    transactions = list(
        {
            transaction["transaction_id"]: transaction for transaction in transactions
        }.values()
    )

    # Znalezienie istniejących rekordów w bazie danych
    existing_receipt_ids = set(
        Receipt.objects.filter(
            receipt_id__in=[r["receipt_id"] for r in receipts]
        ).values_list("receipt_id", flat=True)
    )
    existing_transaction_ids = set(
        Transaction.objects.filter(
            transaction_id__in=[t["transaction_id"] for t in transactions]
        ).values_list("transaction_id", flat=True)
    )

    # Usunięcie istniejących rekordów z danych do zapisania
    new_receipts = [r for r in receipts if r["receipt_id"] not in existing_receipt_ids]
    new_transactions = [
        t for t in transactions if t["transaction_id"] not in existing_transaction_ids
    ]

    # Zapisanie nowych rekordów do bazy danych
    Receipt.objects.bulk_create([Receipt(**r) for r in new_receipts])
    Transaction.objects.bulk_create([Transaction(**t) for t in new_transactions])

    return JsonResponse(
        data={
            "message": "Data imported successfully",
            "new_receipts_count": len(new_receipts),
            "new_transactions_count": len(new_transactions),
        },
        status=201,
    )


@api_view(["GET"])
def fetch_bar_persons(request):
    ## Get owner, month, and year from the GET request
    selected_month = int(request.GET.get("month"))
    selected_year = int(request.GET.get("year"))
    selected_category = request.GET.get("category")

    CATEGORY_CHOICES = [
        ("fuel", "Paliwo"),
        ("car_expenses", "Wydatki na samochód"),
        ("fastfood", "Fast Food"),
        ("alcohol", "Alkohol"),
        ("food_drinks", "Picie & jedzenie"),
        ("chemistry", "Chemia"),
        ("clothes", "Ubrania"),
        ("electronics_games", "Elektornika & gry"),
        ("tickets_entrance", "Bilety & wejściówki"),
        ("other_shopping", "Inne zakupy"),
        ("flat_bills", "Rachunki za mieszkanie"),
        ("monthly_subscriptions", "Miesięczne subskrypcje"),
        ("other_cyclical_expenses", "Inne cykliczne wydatki"),
        ("investments_savings", "Inwestycje & oszczędności"),
        ("other", "Inne"),
    ]

    try:
        ## Check if the selected category is valid
        if selected_category not in dict(CATEGORY_CHOICES).keys():
            raise Exception("Invalid category")
    except Exception as e:
        ## Return error message if an exception occurs
        return JsonResponse(
            data={"error": str(e) + ", request_category: " + selected_category},
            status=400,
        )

    try:
        ## Fetch all expense receipts for the given owner, month, and year
        expense_receipts = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__month=selected_month,
            payment_date__year=selected_year,
        ).distinct()

    except Exception as e:
        ## Return error message if an exception occurs
        return JsonResponse(
            data={"error": str(e) + "expense/income receipts"}, status=500
        )

    try:
        ## Process the expenses by persons and category, and compute sums.
        #  @param receipts Receipts queryset to process.
        #  @return dictionary perso: sum of transaction values.
        def process_transactions(receipts):
            persons_expense_sums = {}
            for receipt in receipts:
                for transaction in receipt.transactions.all():
                    if transaction.category != selected_category:
                        continue
                    person = transaction.owner
                    value = float(transaction.value)
                    if person in persons_expense_sums:
                        persons_expense_sums[person] += value
                    else:
                        persons_expense_sums[person] = value
            return persons_expense_sums

        ## Process expense transactions
        persons_expense_sums = process_transactions(expense_receipts)

        ## Return JSON response with cumulative sums for expenses and incomes
        return JsonResponse(
            data=persons_expense_sums,
            status=200,
        )

    except Exception as e:
        ## Return error message if an exception occurs
        return JsonResponse(data={"error": str(e)}, status=500)
