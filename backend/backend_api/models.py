from django.db import models
from django.db.models import Sum
from django.utils import timezone

# Create your models here.


# Model User (używamy wbudowanego modelu User z Django, ale możesz go dostosować)
class Person(models.Model):
    name = models.CharField(max_length=100, unique=True)
    payer = models.BooleanField(default=False)
    owner = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# Model Item
class Item(models.Model):
    CATEGORY_CHOICES = [
        ("fuel", "Paliwo"),
        ("car_expenses", "Wydatki na samochód"),
        ("fastfood", "Fast Food"),
        ("alcohol", "Alkohol"),
        ("food_drinks", "Picie & jedzenie"),
        ("chemistry", "Chemia"),
        ("clothes", "Ubrania"),
        ("electronics_games", "Elektornika & gry"),
        ("tickets_entrance", "Bilety & wejściówki"),
        ("delivery", "Dostawa"),
        ("other_shopping", "Inne zakupy"),
        ("flat_bills", "Rachunki za mieszkanie"),
        ("monthly_subscriptions", "Miesięczne subskrypcje"),
        ("other_cyclical_expenses", "Inne cykliczne wydatki"),
        ("investments_savings", "Inwestycje & oszczędności"),
        ("other", "Inne"),
        ("for_study", "Na studia"),
        ("work_income", "Przychód z pracy"),
        ("family_income", "Przychód od rodziny"),
        ("investments_income", "Przychód z inwestycji"),
        ("money_back", "Zwrot pieniędzy"),
        ("last_month_balance", "Saldo z poprzedniego miesiąca"),
    ]

    save_date = models.DateField(auto_now_add=True, null=True)
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True, default="")
    quantity = models.DecimalField(max_digits=10, decimal_places=0, default=1)
    # owners = models.JSONField(blank=False, default=list)
    owners = models.ManyToManyField(Person, related_name="items")
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.description


# Model Receipt
class Receipt(models.Model):
    TRANSACTION_CHOICES = [
        ("expense", "Expense"),
        ("income", "Income"),
    ]
    save_date = models.DateField(auto_now_add=True, null=True)
    payment_date = models.DateField()
    payer = models.ForeignKey(
        Person,
        related_name="payer_receipts",  # Relacja w drugą stronę: Person -> Receipts
        limit_choices_to={"payer": True},  # Tylko osoby z `payer=True`
        on_delete=models.CASCADE,  # Usunięcie osoby usuwa wszystkie jej paragony
    )

    shop = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=255, choices=TRANSACTION_CHOICES)
    items = models.ManyToManyField(Item, related_name="receipts")
    payment_date = models.DateField()

    def __str__(self):
        return f"Receipt {self.id}"


class RecentShop(models.Model):
    name = models.CharField(max_length=255, unique=True)
    last_used = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ItemPrediction(models.Model):
    item_description = models.CharField(
        max_length=255, unique=True
    )  # Unique item descriptions
    frequency = models.PositiveIntegerField(
        default=0
    )  # Frequency of item occurrence in receipts

    def increment_frequency(self):
        """Increase the frequency of the item."""
        self.frequency += 1
        self.save()

    def __str__(self):
        return f"{self.item_description}: {self.frequency} times"


class Wallet(models.Model):
    name = models.CharField(max_length=100)
    total_value = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_invest_income = models.DecimalField(
        max_digits=20, decimal_places=2, default=0
    )
    last_update = models.DateTimeField(auto_now=True)
    parent_wallet = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_wallets",
    )

    def __str__(self):
        return self.name

    def update_totals(self):
        # Sum wartości z wszystkich powiązanych inwestycji
        total = self.investments.aggregate(total=Sum("current_value"))["total"] or 0
        self.total_value = total
        # Możesz dodać dodatkowe obliczenia, np. dla zysków
        self.save()


class WalletSnapshot(models.Model):
    wallet = models.ForeignKey(
        Wallet, on_delete=models.CASCADE, related_name="snapshots"
    )
    snapshot_date = models.DateTimeField(default=timezone.now)
    total_value = models.DecimalField(max_digits=20, decimal_places=2)
    total_invest_income = models.DecimalField(max_digits=20, decimal_places=2)

    def __str__(self):
        return (
            f"Snapshot {self.wallet.name} z {self.snapshot_date.strftime('%Y-%m-%d')}"
        )


class Invest(models.Model):
    wallet = models.ForeignKey(
        Wallet, on_delete=models.CASCADE, related_name="investments"
    )
    # Zakładamy, że istnieje model Instrument, który reprezentuje aktywo (np. akcje)
    instrument = models.ForeignKey(
        "Instrument", on_delete=models.CASCADE, related_name="investments"
    )
    # Wartość operacji (może być wartością zakupu lub bieżącą wartością)
    value = models.DecimalField(max_digits=20, decimal_places=2)
    # Przechowuje bieżącą wartość inwestycji, która może być aktualizowana przy każdej synchronizacji
    current_value = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    payment_date = models.DateField()
    TRANSACTION_TYPES = (
        ("buy", "Kupno"),
        ("sell", "Sprzedaż"),
        ("dividend", "Dywidenda"),
        # inne typy operacji
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    def __str__(self):
        return f"{self.instrument.name} - {self.get_transaction_type_display()}"

    def update_current_value(self, new_price):
        # Możesz obliczyć bieżącą wartość na podstawie aktualnego kursu
        self.current_value = self.value * new_price  # lub inna logika
        self.save()


class Instrument(models.Model):
    CATEGORY_CHOICES = (
        ("stock", "Akcje"),
        ("etf", "ETF"),
        ("bond", "Obligacje"),
        ("crypto", "Kryptowaluty"),
        ("commodity", "Surowce"),
        ("other", "Inne"),
    )

    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    market = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Nazwa giełdy lub rynku (np. GPW, NASDAQ)",
    )
    currency = models.CharField(max_length=10, default="PLN")
    description = models.TextField(blank=True, null=True)
    current_price = models.DecimalField(
        max_digits=20, decimal_places=2, blank=True, null=True
    )
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"
