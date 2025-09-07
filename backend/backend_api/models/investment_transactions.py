from django.db import models
from .investments import Investment


class InvestmentTransaction(models.Model):
    TRANSACTION_TYPE = [
        ("deposit", "Wpłata"),
        ("withdrawal", "Wypłata"),
        ("profit", "Kapitalizacja/zysk"),
        # możesz dodać np. ("buy", "Zakup"), ("sell", "Sprzedaż"), ("dividend", "Dywidenda") dla pełnej obsługi rynku akcji
    ]
    investment = models.ForeignKey(
        Investment, on_delete=models.CASCADE, related_name="transactions"
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    units = models.DecimalField(
        max_digits=12, decimal_places=6, null=True, blank=True
    )  # ILOŚĆ
    purchase_price = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True
    )  # CENA ZA JEDNOSTKĘ
    type = models.CharField(max_length=16, choices=TRANSACTION_TYPE)
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.get_type_display()} {self.value} ({self.date})"
