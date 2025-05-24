# src/api/views/balance_views.py

from datetime import date

from django.db import transaction as db_transaction
from django.db.models import Sum, F, Count, FloatField
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from backend_api.models import Item, Receipt, Person
from backend_api.serializers import ReceiptSerializer, ItemSerializer


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Lista ID właścicieli (share liczona per właściciel)",
            required=True,
            type=int,
            many=True,
        ),
        OpenApiParameter(
            name="year",
            description="Rok, dla którego pobieramy bilans",
            required=True,
            type=int,
        ),
        OpenApiParameter(
            name="month",
            description="Miesiąc (1–12), dla którego pobieramy bilans",
            required=True,
            type=int,
        ),
    ],
    responses={
        200: OpenApiResponse(
            description=(
                "computed_balance: wyliczone saldo udziałów\n"
                "saved_balance: zapisany udział w bazie (jeśli istnieje)\n"
                "difference: computed - saved\n"
                "create: czy trzeba stworzyć zapis"
            )
        ),
        400: OpenApiResponse(description="Bad request"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
@extend_schema(
    methods=["POST"],
    request=OpenApiResponse(
        description="Body: { year: int, month: int, value: Decimal }"
    ),
    responses={
        201: ReceiptSerializer,
        400: OpenApiResponse(description="Missing or invalid fields"),
        500: OpenApiResponse(description="Internal server error"),
    },
)
class BalanceView(APIView):
    def get(self, request):
        # parsowanie parametrów
        owner_ids = request.query_params.getlist("owners[]")
        try:
            owners = [int(o) for o in owner_ids]
            year = int(request.query_params["year"])
            month = int(request.query_params["month"])
        except (KeyError, ValueError):
            return Response(
                {
                    "detail": "Parametry owners[], year i month są wymagane i muszą być liczbami."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- LICZENIE PRZYCHODÓW ---
        income_share = 0
        receipts_inc = Receipt.objects.filter(
            transaction_type="income",
            payment_date__year=year,
            payment_date__month=month,
        ).prefetch_related("items__owners")
        for receipt in receipts_inc:
            for item in receipt.items.all():
                # jeżeli item należy do któregoś z właścicieli
                item_owner_ids = [o.id for o in item.owners.all()]
                common = set(item_owner_ids) & set(owners)
                if common:
                    share = float(item.value) / item.owners.count()
                    # dodaj share tylko raz na item
                    income_share += share

        # --- LICZENIE WYDATKÓW ---
        expense_share = 0
        receipts_exp = Receipt.objects.filter(
            transaction_type="expense",
            payment_date__year=year,
            payment_date__month=month,
        ).prefetch_related("items__owners")
        for receipt in receipts_exp:
            for item in receipt.items.all():
                item_owner_ids = [o.id for o in item.owners.all()]
                common = set(item_owner_ids) & set(owners)
                if common:
                    share = float(item.value) / item.owners.count()
                    expense_share += share

        computed_balance = round(income_share - expense_share, 2)

        # --- SPRAWDZENIE ZAPISANEGO SALDA ---
        saved_qs = Receipt.objects.filter(
            transaction_type="income",
            items__category="last_month_balance",
            payment_date=date(year, month, 1),
            items__owners__id__in=owners,
        ).distinct()

        if saved_qs.exists():
            saved_item = saved_qs.first().items.get(category="last_month_balance")
            owner_count = saved_item.owners.count()
            saved_share = round(float(saved_item.value) / owner_count, 2)
            return Response(
                {
                    "computed_balance": computed_balance,
                    "saved_balance": saved_share,
                    "difference": round(computed_balance - saved_share, 2),
                    "create": False,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "computed_balance": computed_balance,
                    "create": True,
                    "year": year,
                    "month": month,
                },
                status=status.HTTP_200_OK,
            )

    @db_transaction.atomic
    def post(self, request):
        year = request.data.get("year")
        month = request.data.get("month")
        value = request.data.get("value")

        if year is None or month is None or value is None:
            return Response(
                {"detail": "Podaj pola year, month i value."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payer = Person.objects.filter(payer=True).first()
        if not payer:
            return Response(
                {"detail": "Brak zdefiniowanego payer w systemie."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payment_date = date(int(year), int(month), 1)
        receipt = Receipt.objects.create(
            save_date=date.today(),
            payment_date=payment_date,
            payer=payer,
            shop="Saldo z poprzedniego miesiąca",
            transaction_type="income",
        )

        item = Item.objects.create(
            save_date=date.today(),
            category="last_month_balance",
            value=value,
            description="Saldo z poprzedniego miesiąca",
            quantity=1,
        )
        owners_qs = Person.objects.filter(payer=True)
        item.owners.set(owners_qs)
        receipt.items.add(item)

        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    methods=["GET"],
    parameters=[
        OpenApiParameter(
            name="owners[]",
            description="Lista ID właścicieli (share liczona per właściciel)",
            required=True,
            type=int,
            many=True,
        ),
        OpenApiParameter(
            name="year",
            description="Rok, dla którego pobieramy bilans",
            required=True,
            type=int,
        ),
        OpenApiParameter(
            name="month",
            description="Miesiąc (1–12), dla którego pobieramy bilans",
            required=True,
            type=int,
        ),
    ],
    responses={
        200: OpenApiResponse(
            description="{ invest: float, spending: float, fun: float }"
        ),
        400: OpenApiResponse(description="Bad request"),
    },
)
class SpendingRatioView(APIView):
    INVEST_CATS = ["investments_savings"]
    SPENDING_CATS = [
        "fuel",
        "car_expenses",
        "food_drinks",
        "chemistry",
        "tickets_entrance",
        "flat_bills",
    ]
    FUN_CATS = [
        "fastfood",
        "alcohol",
        "clothes",
        "electronics_games",
        "delivery",
        "other_shopping",
        "monthly_subscriptions",
        "other_cyclical_expenses",
        "other",
    ]

    def get(self, request):
        owner_ids = request.query_params.getlist("owners[]")
        try:
            owners = [int(o) for o in owner_ids]
            year = int(request.query_params["year"])
            month = int(request.query_params["month"])
        except (KeyError, ValueError):
            return Response(
                {
                    "detail": "Parametry owners[], year i month są wymagane i muszą być liczbami."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not (year and month and owners):
            return Response(
                {"detail": "Podaj pola year, month i owner."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        owner = get_object_or_404(Person, pk=owners[0])

        # Pobieramy Itemy powiązane z Expense Receipt i z ownerem
        items = Item.objects.filter(
            receipts__transaction_type="expense",
            receipts__payment_date__year=year,
            receipts__payment_date__month=month,
            owners=owner,
        ).annotate(
            owner_count=Count("owners"),
            share=F("value") / F("owner_count"),
        )

        # Dla każdej grupy wyciągamy ID i sumę share
        invest_qs = items.filter(category__in=self.INVEST_CATS)
        spending_qs = items.filter(category__in=self.SPENDING_CATS)
        fun_qs = items.filter(category__in=self.FUN_CATS)

        sums = {
            "invest": invest_qs.aggregate(
                total=Sum("share", output_field=FloatField())
            )["total"]
            or 0,
            "spending": spending_qs.aggregate(
                total=Sum("share", output_field=FloatField())
            )["total"]
            or 0,
            "fun": fun_qs.aggregate(total=Sum("share", output_field=FloatField()))[
                "total"
            ]
            or 0,
        }

        # Listy ID
        ids = {
            "invest_ids": list(invest_qs.values_list("id", flat=True)),
            "spending_ids": list(spending_qs.values_list("id", flat=True)),
            "fun_ids": list(fun_qs.values_list("id", flat=True)),
        }

        total = sums["invest"] + sums["spending"] + sums["fun"]
        if total == 0:
            return Response(
                {"detail": "Brak wydatków w tym okresie."},
                status=status.HTTP_200_OK,
            )

        result = {
            "invest": round(sums["invest"] / total * 100, 2),
            "spending": round(sums["spending"] / total * 100, 2),
            "fun": round(sums["fun"] / total * 100, 2),
            **ids,
        }

        return Response(result, status=status.HTTP_200_OK)
