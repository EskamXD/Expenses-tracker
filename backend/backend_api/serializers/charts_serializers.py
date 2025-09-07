from rest_framework import serializers


from backend_api.models import Person


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
    fill = serializers.CharField()

    class Meta:
        fields = ["category", "expense_sum", "fill"]
