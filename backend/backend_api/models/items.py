from django.db import models
from .persons import Person


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
    owners = models.ManyToManyField(Person, related_name="items")
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.description
