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
        fields = [
            "id",
            "save_date",
            "category",
            "value",
            "description",
            "quantity",
            "owner",
        ]


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
            "save_date",
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
        instance = super().update(instance, validated_data)

        # Usuń istniejące itemy
        instance.items.clear()

        for item_data in items_data:
            # Szukaj itemu, który może być już w bazie
            item, _ = Item.objects.get_or_create(
                category=item_data["category"],
                description=item_data["description"],
                owner=item_data["owner"],
                defaults={
                    "value": item_data["value"],
                    "quantity": item_data["quantity"],
                },
            )

            # Dodaj item do Receipt
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
