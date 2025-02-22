from django.contrib import admin
from .models import Person, Item, Receipt


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "payer", "owner")  # Pola widoczne w widoku listy
    search_fields = ("name",)  # Możliwość wyszukiwania po imieniu
    list_filter = ("payer", "owner")  # Filtry po polach `payer` i `owner`


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "description", "category", "value", "quantity")  # Widok listy
    search_fields = ("description",)  # Wyszukiwanie po opisie
    list_filter = ("category",)  # Filtracja po kategorii
    filter_horizontal = ("owners",)  # Interfejs do zarządzania relacją ManyToMany


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "payer",
        "payment_date",
        "shop",
        "transaction_type",
    )  # Widok listy
    search_fields = (
        "shop",
        "payer__name",
    )  # Wyszukiwanie po sklepie i imieniu płatnika
    list_filter = (
        "transaction_type",
        "payment_date",
    )  # Filtry po typie transakcji i dacie
    filter_horizontal = ("items",)  # Interfejs do zarządzania relacją ManyToMany
