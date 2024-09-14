# from django_filters import rest_framework as filters
# from .models import Transaction, Receipt


# class TransactionFilter(filters.FilterSet):
#     transaction_type = filters.CharFilter(
#         field_name="receipt__transaction_type", lookup_expr="exact"
#     )
#     month = filters.NumberFilter(field_name="save_date", lookup_expr="month")
#     year = filters.NumberFilter(field_name="save_date", lookup_expr="year")
#     owner = filters.CharFilter(field_name="owner", lookup_expr="exact")

#     class Meta:
#         model = Transaction
#         fields = ["transaction_type", "owner", "month", "year"]


# class ReceiptFilter(filters.FilterSet):
#     owner = filters.CharFilter(field_name="transactions__owner", lookup_expr="exact")
#     payer = filters.CharFilter(field_name="payer", lookup_expr="exact")
#     day = filters.NumberFilter(field_name="payment_date", lookup_expr="day")
#     month = filters.NumberFilter(field_name="payment_date", lookup_expr="month")
#     year = filters.NumberFilter(field_name="payment_date", lookup_expr="year")
#     payment_date = filters.DateFromToRangeFilter(
#         field_name="payment_date", lookup_expr="range"
#     )
#     transaction_type = filters.CharFilter(
#         field_name="transaction_type", lookup_expr="exact"
#     )

#     class Meta:
#         model = Receipt
#         fields = ["owner", "payer", "month", "year", "payment_date", "transaction_type"]
