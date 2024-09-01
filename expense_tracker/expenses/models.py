from django.db import models


# Create your models here.
class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("paliwo", "Paliwo"),
        ("wydatki_samochód", "Wydatki Samochód"),
        ("fastfood", "Fastfood"),
        ("alkohol", "Alkohol"),
        ("picie_jedzenie", "Picie & Jedzenie"),
        ("chemia", "Chemia"),
        ("ubrania", "Ubrania"),
        ("elektronika_gry", "Elektronika & Gry"),
        ("bilety_wejsciowki", "Bilety & Wejściówki"),
        ("inne_zakupy", "Inne Zakupy"),
        ("opis_zakupow", "Opis Zakupów"),
        ("mieszkanie", "Mieszkanie"),
        ("miesieczne_subskrypcje", "Miesięczne Subskrypcje"),
        ("inne_cykliczne_wydatki", "Inne Cykliczne Wydatki"),
        ("inwestycje_lokaty_oszczednosci", "Inwestycje, Lokaty & Oszczędności"),
        ("inne", "Inne"),
        ("opis_innych", "Opis Innych"),
    ]

    PAYER_CHOICES = [("K", "K"), ("A", "A")]

    OWNER_CHOICES = [("K", "K"), ("A", "A"), ("Wspólne", "Wspólne")]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    payer = models.CharField(max_length=1, choices=PAYER_CHOICES)
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    is_shared = models.BooleanField(
        default=False
    )  # Nowe pole, True dla wydatków wspólnych

    def __str__(self):
        return f"{self.amount} - {self.category} - {self.payer} - {self.owner}"


class Income(models.Model):
    CATEGORY_CHOICES = [
        ("na_studia", "Na studia"),
        ("saldo_z_poprzedniego_miesiaca", "Saldo z poprzedniego miesiąca"),
        ("przychod", "Przychód"),
        ("przychod_rodzina", "Przychód rodzina"),
        ("inwestycje_lokaty_oszczednosci", "Inwestycje, Lokaty & Oszczędności"),
        ("zwrot", "Zwrot"),
        ("inne", "Inne"),
        ("opis", "Opis"),
    ]

    OWNER_CHOICES = [("K", "K"), ("A", "A")]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.category}"


class Summary(models.Model):
    owner = models.CharField(max_length=50, choices=Expense.OWNER_CHOICES)
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
            Expense.objects.filter(owner=self.owner).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0.00
        )

        # Oblicz bilans (dochód - wydatki)
        self.balance = self.total_income - self.total_expenses

        # Zapisz obliczenia do bazy danych
        self.save()
