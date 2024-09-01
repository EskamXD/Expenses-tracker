# import serializers from the REST framework
from rest_framework import serializers

# import the expense data model
from .models import Expense
from .models import Income
from .models import Summary


# create a serializer class
class ExpenseSerializer(serializers.ModelSerializer):
    # create a meta class
    class Meta:
        model = Expense
        fields = ("id", "amount", "category", "payer", "owner", "date", "is_shared")


class IncomeSerializer(serializers.ModelSerializer):
    # create a meta class
    class Meta:
        model = Income
        fields = ("id", "amount", "category", "owner", "date")


class SummarySerializer(serializers.ModelSerializer):
    # create a meta class
    class Meta:
        model = Summary
        fields = ("id", "owner", "total_income", "total_expenses", "balance", "date")
