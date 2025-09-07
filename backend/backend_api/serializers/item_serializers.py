from rest_framework import serializers

from backend_api.models import Item, ItemPrediction, Person


class ItemSerializer(serializers.ModelSerializer):
    owners = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Person.objects.all()
    )

    class Meta:
        model = Item
        fields = [
            "id",
            "save_date",
            "category",
            "value",
            "description",
            "quantity",
            "owners",
        ]

    def create(self, validated_data):
        owners_data = validated_data.pop("owners", [])
        item = Item.objects.create(**validated_data)
        item.owners.set(owners_data)
        return item

    def update(self, instance, validated_data):
        owners_data = validated_data.pop("owners", [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.owners.set(owners_data)
        return instance


class ItemPredictionSerializer(serializers.ModelSerializer):
    item_description = serializers.CharField(source="item.description", read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)

    class Meta:
        model = ItemPrediction
        fields = [
            "id",
            "item",
            "item_description",
            "shop",
            "shop_name",
            "frequency",
        ]
