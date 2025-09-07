from django.db import models
from .persons import Person
from .items import Item


class Receipt(models.Model):
    TRANSACTION_CHOICES = [
        ("expense", "Expense"),
        ("income", "Income"),
    ]
    save_date = models.DateField(auto_now_add=True, null=True)
    payment_date = models.DateField()
    payer = models.ForeignKey(
        Person,
        related_name="payer_receipts",
        limit_choices_to={"payer": True},
        on_delete=models.CASCADE,
    )
    shop = models.CharField(max_length=255)
    transaction_type = models.CharField(max_length=255, choices=TRANSACTION_CHOICES)
    items = models.ManyToManyField(Item, related_name="receipts")
    payment_date = models.DateField()

    def __str__(self):
        return f"Receipt {self.id}"
