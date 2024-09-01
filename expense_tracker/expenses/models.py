from django.db import models


# Create your models here.
from django.db import models

class Receipt(models.Model):
    payment_date = models.DateField()  # Nowe pole na przechowywanie daty otrzymanej z API
    save_date = models.DateTimeField(auto_now_add=True)  # Data utworzenia paragonu

    def __str__(self):
        return f"Receipt {self.id} - {self.save_date}"

class Expenses(models.Model):
    CATEGORY_CHOICES = [
        ("fuel", "Paliwo"),
        ("car_expenses", "Wydatki Samochód"),
        ("fastfood", "Fastfood"),
        ("alcohol", "Alkohol"),
        ("food_drinks", "Picie & Jedzenie"),
        ("chemistry", "Chemia"),
        ("clothes", "Ubrania"),
        ("electronics_games", "Elektronika & Gry"),
        ("tickets_entrance", "Bilety & Wejściówki"),
        ("other_shopping", "Inne Zakupy"),
        ("flat_bills", "Mieszkanie"),
        ("monthly_subscriptions", "Miesięczne Subskrypcje"),
        ("other_cyclical_expenses", "Inne Cykliczne Wydatki"),
        ("investments_savings", "Inwestycje, Lokaty & Oszczędności"),
        ("other", "Inne"),
    ]

    PAYER_CHOICES = [("kamil", "Kamil"), ("ania", "Ania")]

    OWNER_CHOICES = [("kamil", "Kamil"), ("ania", "Ania"), ("common", "Wspólne")]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    payer = models.CharField(max_length=50, choices=PAYER_CHOICES)
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)
    receipt = models.ForeignKey(Receipt, related_name='expenses', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.amount} - {self.category} - {self.payer} - {self.owner}"

class Income(models.Model):
    CATEGORY_CHOICES = [
        ("for_study", "Na studia"),
        ("work_income", "Przychód praca"),
        ("family_income", "Przychód rodzina"),
        ("investments_income", "Inwestycje, Lokaty & Oszczędności"),
        ("money_back", "Zwrot"),
        ("other", "Inne"),
    ]

    OWNER_CHOICES = [("K", "K"), ("A", "A")]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.category}"

class Summary(models.Model):
    owner = models.CharField(max_length=50, choices=Expenses.OWNER_CHOICES)
    total_income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary for {self.owner} - {self.date.strftime('%Y-%m-%d')}"

    def calculate_totals(self):
        # Oblicz całkowite przychody dla danego ownera
        self.total_income = (
            Income.objects.filter(owner=self.owner).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0.00
        )

        # Oblicz całkowite wydatki dla danego ownera
        self.total_expenses = (
            Expenses.objects.filter(owner=self.owner).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0.00
        )

        # Oblicz bilans (dochód - wydatki)
        self.balance = self.total_income - self.total_expenses

        # Zapisz obliczenia do bazy danych
        self.save()
