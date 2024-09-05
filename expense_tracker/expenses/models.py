from django.db import models


class Transaction(models.Model):
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
    ]

    OWNER_CHOICES = [("kamil", "Kamil"), ("ania", "Ania"), ("common", "Wspólne")]

    save_date = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.DecimalField(
        max_digits=10, decimal_places=0, blank=True, null=True
    )
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)

    def __str__(self):
        return f"Transaction {self.id} - {self.category} - {self.value}"


class Receipt(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ("expense", "Wydatki"),
        ("income", "Przychody"),
    ]

    payment_date = models.DateField()
    save_date = models.DateTimeField(auto_now_add=True)
    payer = models.CharField(max_length=50, choices=Transaction.OWNER_CHOICES)
    shop = models.CharField(max_length=100, blank=True, null=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    transactions = models.ManyToManyField(Transaction, related_name="receipts")

    def __str__(self):
        return f"Receipt {self.id} - {self.payment_date} - {self.payer}"
