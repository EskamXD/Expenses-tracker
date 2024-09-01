# filters.py

from django_filters import rest_framework as filters
from .models import Expenses

class ExpensesFilter(filters.FilterSet):
    month = filters.NumberFilter(field_name="receipt__payment_date", lookup_expr="month")

    class Meta:
        model = Expenses
        fields = ['month']
