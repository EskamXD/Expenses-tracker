from rest_framework import serializers
from backend_api.models import Wallet, Investment, InvestmentTransaction


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "name", "description", "created_at"]


class InvestmentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentTransaction
        fields = [
            "id",
            "investment",
            "value",
            "current_value",
            "type",
            "date",
            "description",
        ]


class InvestmentSerializer(serializers.ModelSerializer):
    # automatycznie zagnieżdż transakcje jeśli chcesz
    transactions = InvestmentTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Investment
        fields = [
            "id",
            "wallet",
            "name",
            "type",
            "symbol",
            "created_at",
            "interest_rate",
            "capitalization",
            "end_date",
            "transactions",
        ]
