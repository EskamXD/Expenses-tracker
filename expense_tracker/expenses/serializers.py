# import serializers from the REST framework
from rest_framework import serializers

# import the expense data model
from .models import Expenses
from .models import Income
from .models import Summary
from .models import Receipt




# create a serializer class

class ExpensesSerializer(serializers.ModelSerializer):
    payment_date = serializers.DateField(source='receipt.payment_date', read_only=True)

    class Meta:
        model = Expenses
        fields = ['id', 'amount', 'category', 'payer', 'owner', 'payment_date']  # Dodano 'payment_date

class ReceiptSerializer(serializers.ModelSerializer):
    expenses = ExpensesSerializer(many=True)  # obsługa wielu wydatków
    class Meta:
        model = Receipt
        fields = ['id', 'save_date','payment_date', 'expenses']

    def create(self, validated_data):
        expenses_data = validated_data.pop('expenses')
        payment_date = validated_data.pop('payment_date')
        receipt = Receipt.objects.create(payment_date=payment_date, **validated_data)
        for expense_data in expenses_data:
            Expenses.objects.create(receipt=receipt, **expense_data)
        return receipt

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
