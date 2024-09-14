# from rest_framework import serializers
# from rest_framework.reverse import reverse
# from .models import User, Groups, Transaction, Receipt


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "name"]


# class GroupsSerializer(serializers.ModelSerializer):
#     users_array = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all(), many=True
#     )  # Obsługuje wielu użytkowników za pomocą ID

#     class Meta:
#         model = Groups
#         fields = [
#             "id",
#             "users_array",
#         ]

#     def create(self, validated_data):
#         users_data = validated_data.pop("users_array", [])
#         group = super().create(validated_data)
#         group.users_array.set(users_data)  # Ustawienie wielu użytkowników
#         return group

#     def update(self, instance, validated_data):
#         users_data = validated_data.pop("users_array", [])
#         instance = super().update(instance, validated_data)
#         instance.users_array.set(users_data)  # Ustawienie wielu użytkowników
#         return instance


# class TransactionSerializer(serializers.ModelSerializer):
#     owners = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)

#     class Meta:
#         model = Transaction
#         fields = [
#             "id",
#             "owners",
#             "save_date",
#             "category",
#             "value",
#             "description",
#             "quantity",
#         ]

#     def create(self, validated_data):
#         print("================== TransactionSerializer.create ==================")
#         owners_data = validated_data.pop("owners", [])
#         obj = super().create(validated_data)

#         for owner_data in owners_data:
#             owner, _ = User.objects.get_or_create(owner_data)
#             obj.owners.add(owner)

#         return obj

#     def update(self, instance, validated_data):
#         owners_data = validated_data.pop("owners", [])
#         instance.owners.clear()

#         for owner_id in owners_data:
#             owner = User.objects.get(id=owner_id)
#             instance.owners.add(owner)

#         return super().update(instance, validated_data)


# class ReceiptSerializer(serializers.ModelSerializer):
#     payer = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all()
#     )  # Handles a single User by ID
#     transactions = TransactionSerializer(many=True)

#     class Meta:
#         model = Receipt
#         fields = [
#             "id",
#             "payer",
#             "payment_date",
#             "save_date",
#             "transactions",
#         ]

#     def create(self, validated_data):
#         payer_data = validated_data.pop("payer")  # Expecting dict for ForeignKey
#         transactions_data = validated_data.pop("transactions", [])
#         print(type(payer_data), payer_data, payer_data.id, "\n\n\n\n")
#         print(type(transactions_data), transactions_data, "\n\n\n\n")

#         # Create Receipt object
#         obj = super().create(validated_data)

#         # Create or get payer and assign it
#         # payer_id = payer_data.get("id")
#         # print(payer_id, "\n\n\n\n")
#         payer, _ = User.objects.get_or_create(id=payer_data.id)
#         print(payer, "\n\n\n\n")
#         # obj.payer = payer
#         # obj.payer.add(payer)
#         # obj.save()  # Save the receipt to update the payer

#         # Create or get transactions and associate with the receipt
#         for transaction_data in transactions_data:
#             print(
#                 type(transaction_data),
#                 transaction_data,
#                 transaction_data.get("owners"),
#                 "\n\n\n\n",
#             )
#             transaction, _ = Transaction.objects.get_or_create(**transaction_data)
#             print(transaction, "\n\n\n\n")
#             obj.transactions.add(transaction)

#         return obj

#     # def update(self, instance, validated_data):
#     #     payer_data = validated_data.pop("payer")
#     #     transactions_data = validated_data.pop("transactions", [])

#     #     # Update the payer user
#     #     payer, created = User.objects.get_or_create(**payer_data)

#     #     # Update the receipt instance
#     #     instance = super().update(instance, validated_data)

#     #     # Set the payer for the receipt
#     #     instance.payer = payer
#     #     instance.save()  # Save to set payer_id

#     #     for transaction_data in transactions_data:
#     #         transaction, created = Transaction.objects.get_or_create(**transaction_data)
#     #         instance.transactions.add(transaction)

#     #     return instance


# class PersonExpenseSerializer(serializers.Serializer):
#     payer = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all()
#     )  # Zmieniono na ID użytkownika
#     expense_sum = serializers.FloatField()

#     class Meta:
#         fields = ["payer", "expense_sum"]


# class ShopExpenseSerializer(serializers.Serializer):
#     shop = serializers.CharField()
#     expense_sum = serializers.FloatField()

#     class Meta:
#         fields = ["shop", "expense_sum"]


# class CategoryPieExpenseSerializer(serializers.Serializer):
#     category = serializers.CharField(
#         source="transactions__category"
#     )  # Poprawiona referencja
#     expense_sum = serializers.FloatField()

#     class Meta:
#         fields = ["category", "expense_sum"]


from rest_framework import serializers
from .models import Person, Item, Receipt


# Serializator dla User
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name"]


# Serializator dla Item
class ItemSerializer(serializers.ModelSerializer):
    owners = PersonSerializer(many=True)  # Lista właścicieli

    class Meta:
        model = Item
        fields = ["id", "description", "owners"]

    def create(self, validated_data):
        owners_data = validated_data.pop("owners", [])
        item = super().create(validated_data)
        for owner_data in owners_data:
            owner, created = Person.objects.get_or_create(**owner_data)
            item.owners.add(owner)
        return item

    def update(self, instance, validated_data):
        owners_data = validated_data.pop("owners", [])
        instance = super().update(instance, validated_data)
        instance.owners.clear()
        for owner_data in owners_data:
            owner, created = Person.objects.get_or_create(**owner_data)
            instance.owners.add(owner)
        return instance


# Serializator dla Receipt
class ReceiptSerializer(serializers.ModelSerializer):
    payer = PersonSerializer()  # Payer jest użytkownikiem
    items = ItemSerializer(many=True)  # Lista itemów

    class Meta:
        model = Receipt
        fields = ["id", "payer", "items", "payment_date", "save_date"]

    def create(self, validated_data):
        payer_data = validated_data.pop("payer")
        items_data = validated_data.pop("items", [])
        receipt = super().create(validated_data)

        # Ustawienie płatnika
        payer, _ = Person.objects.get_or_create(**payer_data)
        receipt.payer = payer
        receipt.save()

        # Dodanie itemów
        for item_data in items_data:
            item, _ = Item.objects.get_or_create(**item_data)
            receipt.items.add(item)

        return receipt

    def update(self, instance, validated_data):
        payer_data = validated_data.pop("payer")
        items_data = validated_data.pop("items", [])
        instance = super().update(instance, validated_data)

        # Ustawienie płatnika
        payer, _ = Person.objects.get_or_create(**payer_data)
        instance.payer = payer
        instance.save()

        # Ustawienie itemów
        instance.items.clear()
        for item_data in items_data:
            item, _ = Item.objects.get_or_create(**item_data)
            instance.items.add(item)

        return instance
