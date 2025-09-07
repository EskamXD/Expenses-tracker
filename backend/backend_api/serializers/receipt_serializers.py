from django.utils.timezone import now

from rest_framework import serializers

from backend_api.models import (
    Person,
    Receipt,
    RecentShop,
    ItemPrediction,
)

from backend_api.serializers.item_serializers import ItemSerializer


class ReceiptSerializer(serializers.ModelSerializer):
    payer = serializers.PrimaryKeyRelatedField(
        queryset=Person.objects.filter(payer=True)
    )
    items = ItemSerializer(many=True)

    class Meta:
        model = Receipt
        fields = [
            "id",
            "save_date",
            "payment_date",
            "payer",
            "shop",
            "transaction_type",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        receipt = Receipt.objects.create(**validated_data)

        shop_name = validated_data.get("shop", "").strip().lower()
        if shop_name:
            recent_shop, created = RecentShop.objects.get_or_create(name=shop_name)
            if not created:
                recent_shop.last_used = now()
                recent_shop.save()

        for item_data in items_data:
            item_data["owners"] = [
                owner.id if isinstance(owner, Person) else owner
                for owner in item_data.get("owners", [])
            ]
            item_serializer = ItemSerializer(data=item_data)
            item_serializer.is_valid(raise_exception=True)
            item = item_serializer.save()
            receipt.items.add(item)

            # self.update_item_prediction(item, receipt.shop.lower())

        return receipt

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])
        # Aktualizacja pozostałych pól obiektu Receipt
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Czyścimy poprzednie pozycje
        instance.items.clear()

        # Przetwarzamy listę pozycji
        for item_data in items_data:
            # Konwertujemy właścicieli – upewniamy się, że przekazujemy klucze główne
            item_data["owners"] = [
                owner.id if hasattr(owner, "id") else owner
                for owner in item_data.get("owners", [])
            ]
            item_serializer = ItemSerializer(data=item_data)
            item_serializer.is_valid(raise_exception=True)
            item = item_serializer.save()
            instance.items.add(item)

            # Używamy instance.shop, a nie niezdefiniowanego receipt
            # self.update_item_prediction(item, instance.shop.lower())

        return instance

    def update_item_prediction(self, item, shop_name):
        """
        Aktualizuje model ItemPrediction z danymi przedmiotu z paragonu.
        """
        item_description = item.description.strip().lower()
        if not item_description:
            return

        # Pobierz lub utwórz predykcję na podstawie opisu przedmiotu
        prediction, created = ItemPrediction.objects.get_or_create(
            item_description=item_description
        )

        # Zwiększ częstotliwość, jeśli predykcja już istnieje
        if not created:
            prediction.frequency += 1
        else:
            prediction.frequency = 1  # Ustaw początkową wartość częstotliwości

        prediction.save()
