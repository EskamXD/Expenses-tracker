from rest_framework import serializers
from .models import Transaction, Receipt


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "save_date",
            "category",
            "value",
            "description",
            "quantity",
            "owner",
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True)  # Handles multiple transactions

    class Meta:
        model = Receipt
        fields = [
            "id",
            "save_date",
            "payment_date",
            "payer",
            "shop",
            "transaction_type",
            "transactions",
        ]

    def create(self, validated_data):
        transactions_data = validated_data.pop("transactions")
        receipt = Receipt.objects.create(**validated_data)

        # Create or get transactions and associate with the receipt
        transactions = []
        for transaction_data in transactions_data:
            transaction, created = Transaction.objects.get_or_create(**transaction_data)
            transactions.append(transaction)

        # Using set() to associate transactions with the receipt
        receipt.transactions.set(transactions)

        return receipt

    def update(self, instance, validated_data):
        transactions_data = validated_data.pop("transactions", None)

        if transactions_data is not None:
            transactions = []
            for transaction_data in transactions_data:
                transaction, created = Transaction.objects.get_or_create(
                    **transaction_data
                )
                transactions.append(transaction)

            # Using set() to update the associated transactions
            instance.transactions.set(transactions)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class PersonExpenseSerializer(serializers.Serializer):
    payer = serializers.CharField()
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["payer", "expense_sum"]


class ShopExpenseSerializer(serializers.Serializer):
    shop = serializers.CharField()
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["shop", "expense_sum"]


class CategoryPieExpenseSerializer(serializers.Serializer):
    transactions__category = serializers.CharField()
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["transactions__category", "expense_sum"]
