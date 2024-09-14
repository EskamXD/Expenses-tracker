from rest_framework import serializers
from .models import Person, Item, Receipt


# Serializator dla PersonPayer
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "payer", "owner"]


# Serializator dla Item
class ItemSerializer(serializers.ModelSerializer):
    owners = serializers.ListField(
        child=serializers.IntegerField(),  # Lista identyfikatorów
        required=False,  # To pole jest opcjonalne, jeśli chcesz, aby było opcjonalne
        default=list,  # Ustawiamy domyślną wartość jako pustą listę
    )

    class Meta:
        model = Item
        fields = ["id", "category", "value", "description", "quantity", "owners"]


# Serializator dla Receipt
class ReceiptSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True)  # Serializator dla itemów

    class Meta:
        model = Receipt
        fields = ["id", "payment_date", "payer", "shop", "transaction_type", "items"]

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
