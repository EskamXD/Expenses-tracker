from django_filters import rest_framework as filters
from .models import Item, Receipt


class ItemFilter(filters.FilterSet):
    owners = filters.CharFilter(field_name="owners", lookup_expr="exact")

    class Meta:
        model = Item
        fields = ["owners"]


class ReceiptFilter(filters.FilterSet):
    # owners = filters.CharFilter(field_name="items__owner", lookup_expr="exact")
    id = filters.NumberFilter(field_name="id", lookup_expr="exact")
    owners = filters.BaseInFilter(field_name="items__owners__id", lookup_expr="in")
    payer = filters.CharFilter(field_name="payer", lookup_expr="exact")
    shop = filters.CharFilter(field_name="shop", lookup_expr="icontains")
    day = filters.NumberFilter(field_name="payment_date", lookup_expr="day")
    month = filters.NumberFilter(field_name="payment_date", lookup_expr="month")
    year = filters.NumberFilter(field_name="payment_date", lookup_expr="year")
    payment_date = filters.DateFromToRangeFilter(
        field_name="payment_date", lookup_expr="range"
    )
    transaction_type = filters.CharFilter(
        field_name="transaction_type", lookup_expr="exact"
    )
    category = filters.BaseInFilter(field_name="items__category", lookup_expr="in")

    class Meta:
        model = Receipt
        fields = [
            "owners",
            "payer",
            "month",
            "year",
            "payment_date",
            "transaction_type",
            "category",
        ]
