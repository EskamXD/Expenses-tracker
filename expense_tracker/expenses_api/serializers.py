from rest_framework import serializers
from .models import Person, Item, Receipt


# Serializator dla PersonPayer
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "payer", "owner"]


# Serializator dla Item
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "category", "value", "description", "quantity", "owner"]


# Serializator dla Receipt
class ReceiptSerializer(serializers.ModelSerializer):
    # url = serializers.HyperlinkedIdentityField(
    #     view_name="receipt-detail", read_only=True
    # )
    items = ItemSerializer(many=True)  # Serializator dla itemów

    class Meta:
        model = Receipt
        fields = [
            "id",
            # "url",
            "payment_date",
            "payer",
            "shop",
            "transaction_type",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        # Tworzenie obiektu Receipt
        receipt = super().create(validated_data)

        # Dodanie itemów do Receipt
        for item_data in items_data:
            item = Item.objects.create(**item_data)
            receipt.items.add(item)

        return receipt

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

        # Aktualizacja Receipt
        instance = super().update(instance, validated_data)

        # Aktualizacja itemów
        instance.items.clear()
        for item_data in items_data:
            item, _ = Item.objects.get_or_create(**item_data)
            instance.items.add(item)

        return instance


class PersonExpenseSerializer(serializers.Serializer):
    payer = serializers.PrimaryKeyRelatedField(
        queryset=Person.objects.all()
    )  # Zmieniono na ID użytkownika
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["payer", "expense_sum"]


class ShopExpenseSerializer(serializers.Serializer):
    shop = serializers.CharField()
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["shop", "expense_sum"]


class CategoryPieExpenseSerializer(serializers.Serializer):
    category = serializers.CharField(
        source="transactions__category"
    )  # Poprawiona referencja
    expense_sum = serializers.FloatField()

    class Meta:
        fields = ["category", "expense_sum"]
