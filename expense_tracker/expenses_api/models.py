from django.db import models

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

    save_date = models.DateField(auto_now_add=True, null=True)
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True, default="")
    quantity = models.DecimalField(max_digits=10, decimal_places=0, default=1)
    owner = models.DecimalField(max_digits=10, decimal_places=0)
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
    payer = models.DecimalField(max_digits=10, decimal_places=0, default=1)
    shop = models.CharField(max_length=255, blank=True)
    transaction_type = models.CharField(max_length=255, choices=TRANSACTION_CHOICES)
    items = models.ManyToManyField(Item, related_name="receipts")
    payment_date = models.DateField()

    def __str__(self):
        return f"Receipt {self.id}"
