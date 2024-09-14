# from django.db import models
# from django.conf import settings
# from django.core.exceptions import ValidationError


# class User(models.Model):
#     name = models.CharField(max_length=100)

#     def id(self):
#         return self.id

#     def __str__(self):
#         return f"User {self.id} - {self.name}"


# class Groups(models.Model):
#     users_array = models.ManyToManyField(User)

#     def __str__(self):
#         return f"Group {self.id} - Users: {self.users_array}"


# class Transaction(models.Model):
#     CATEGORY_CHOICES = [
#         ("fuel", "Paliwo"),
#         ("car_expenses", "Wydatki na samochód"),
#         ("fastfood", "Fast Food"),
#         ("alcohol", "Alkohol"),
#         ("food_drinks", "Picie & jedzenie"),
#         ("chemistry", "Chemia"),
#         ("clothes", "Ubrania"),
#         ("electronics_games", "Elektornika & gry"),
#         ("tickets_entrance", "Bilety & wejściówki"),
#         ("other_shopping", "Inne zakupy"),
#         ("flat_bills", "Rachunki za mieszkanie"),
#         ("monthly_subscriptions", "Miesięczne subskrypcje"),
#         ("other_cyclical_expenses", "Inne cykliczne wydatki"),
#         ("investments_savings", "Inwestycje & oszczędności"),
#         ("other", "Inne"),
#         ("for_study", "Na studia"),
#         ("work_income", "Przychód z pracy"),
#         ("family_income", "Przychód od rodziny"),
#         ("investments_income", "Przychód z inwestycji"),
#         ("money_back", "Zwrot pieniędzy"),
#     ]

#     # Zakładam, że użytkownicy są przechowywani w modelu User
#     owners = models.ManyToManyField(User, related_name="transactions")

#     save_date = models.DateTimeField(auto_now_add=True)
#     category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
#     value = models.DecimalField(max_digits=10, decimal_places=2)
#     description = models.CharField(max_length=100, blank=True, null=True)
#     quantity = models.DecimalField(
#         max_digits=10, decimal_places=0, blank=True, default=1
#     )

#     def __str__(self):
#         return f"Transaction {self.id} - {self.category} - {self.value} PLN - {self.save_date} - Owners: {[owner.name for owner in self.owners.all()]} - {self.description} - Quantity: {self.quantity}"


# class Receipt(models.Model):
#     TRANSACTION_TYPE_CHOICES = [
#         ("expense", "Wydatki"),
#         ("income", "Przychody"),
#     ]

#     payment_date = models.DateField()
#     save_date = models.DateTimeField(auto_now_add=True)
#     payer = models.ManyToManyField(User, related_name="receipts")
#     shop = models.CharField(max_length=100, blank=True, null=True)
#     transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
#     transactions = models.ManyToManyField(Transaction, related_name="receipts")

#     def id(self):
#         return self.id

#     def __str__(self):
#         return f"Receipt {self.id} - {self.payment_date} - {self.save_date} - Payer: {self.payer.name} - Shop: {self.shop} - Type: {self.transaction_type} - Transactions: {[transaction.id for transaction in self.transactions.all()]}"
