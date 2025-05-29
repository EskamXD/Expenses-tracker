# src/api/views/balance_views.py

from datetime import date

from django.db import transaction as db_transaction
from django.db.models import Sum, F, Q, Count, FloatField
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
@extend_schema(
    methods=["PATCH"],
    parameters=[
        OpenApiParameter(
            name="item_id",
            description="ID pozycji last_month_balance do zaktualizowania",
            required=True,
            type=int,
            location=OpenApiParameter.QUERY,
        ),
    ],
    request=OpenApiResponse(description="Body: { value: Decimal }"),
    responses={
        200: ReceiptSerializer,
        400: OpenApiResponse(description="Missing or invalid fields"),
        404: OpenApiResponse(description="Item not found"),
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

        # wyliczamy next_year i next_month:
        if month == 12:
            next_year, next_month = year + 1, 1
        else:
            next_year, next_month = year, month + 1

        next_month_date = date(next_year, next_month, 1)

        saved_qs = Receipt.objects.filter(
            transaction_type="income",
            items__category="last_month_balance",
            payment_date=next_month_date,
            items__owners__id__in=owners,
        ).distinct()

        if saved_qs.exists():
            saved_item = saved_qs.first().items.get(category="last_month_balance")
            owner_count = saved_item.owners.count()
            saved_share = round(float(saved_item.value) / owner_count, 2)
            return Response(
                {
                    "computed_balance": computed_balance,
                    "create": False,
                    "year": year,
                    "month": month,
                    "saved_balance": saved_share,
                    "difference": round(computed_balance - saved_share, 2),
                    "saved_item_id": saved_item.id,
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

    @db_transaction.atomic
    def patch(self, request, item_id: int):
        value = request.data.get("value")
        if value is None:
            return Response({"detail": "Podaj pole value."}, status=400)

        item = get_object_or_404(Item, pk=item_id, category="last_month_balance")
        item.value = value
        item.save(update_fields=["value", "save_date"])

        receipt = Receipt.objects.filter(items=item).first()
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data)


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
        "flat_bills",
    ]
    FUN_CATS = [
        "fastfood",
        "alcohol",
        "clothes",
        "electronics_games",
        "tickets_entrance",
        "delivery",
        "other_shopping",
        "monthly_subscriptions",
        "other_cyclical_expenses",
        "other",
    ]

    def get(self, request):
        # --- parse & validate ---
        owner_ids = request.query_params.getlist(
            "owners[]"
        ) or request.query_params.getlist("owners")
        try:
            owner_id = int(owner_ids[0])
            year = int(request.query_params["year"])
            month = int(request.query_params["month"])
        except (IndexError, KeyError, ValueError):
            return Response(
                {"detail": "Podaj owner (jeden), year i month jako liczby."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        owner = get_object_or_404(Person, pk=owner_id)

        # --- build base queryset for *this* owner ---
        items = Item.objects.filter(
            receipts__transaction_type="expense",
            receipts__payment_date__year=year,
            receipts__payment_date__month=month,
            owners=owner,  # only this owner’s items
        ).annotate(
            owner_count=Count("owners", distinct=True),
            share=F("value") / F("owner_count"),
        )

        # --- split by category ---
        invest_qs = items.filter(category__in=self.INVEST_CATS)
        spending_qs = items.filter(category__in=self.SPENDING_CATS)
        fun_qs = items.filter(category__in=self.FUN_CATS)

        # --- sum up shares ---
        sums = {}
        for key, qs in [
            ("invest", invest_qs),
            ("spending", spending_qs),
            ("fun", fun_qs),
        ]:
            total = qs.aggregate(t=Sum("share", output_field=FloatField()))["t"] or 0
            sums[key] = total

        total_all = sums["invest"] + sums["spending"] + sums["fun"]
        if total_all == 0:
            return Response(
                {
                    "available": False,
                    "detail": "Brak wydatków w tym okresie dla tego właściciela.",
                },
                status=status.HTTP_200_OK,
            )

        # --- build response ---
        result = {
            "available": True,
            "invest": round(sums["invest"] / total_all * 100, 2),
            "spending": round(sums["spending"] / total_all * 100, 2),
            "fun": round(sums["fun"] / total_all * 100, 2),
            # optional: item IDs if you still need them
            "invest_ids": list(invest_qs.values_list("id", flat=True)),
            "spending_ids": list(spending_qs.values_list("id", flat=True)),
            "fun_ids": list(fun_qs.values_list("id", flat=True)),
        }
        return Response(result, status=status.HTTP_200_OK)
