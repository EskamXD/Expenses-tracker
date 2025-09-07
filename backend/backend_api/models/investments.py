from django.db import models
from .wallets import Wallet
from .investment_types import InvestmentType
from decimal import Decimal

from django.db.models.signals import post_save, post_delete
from contextlib import contextmanager


@contextmanager
def disable_signals_for(model):
    # importuj sygnał DOPIERO tutaj!
    from backend_api.signals import recalculate_investment_on_transaction_change

    post_save.disconnect(recalculate_investment_on_transaction_change, sender=model)
    post_delete.disconnect(recalculate_investment_on_transaction_change, sender=model)
    try:
        yield
    finally:
        post_save.connect(recalculate_investment_on_transaction_change, sender=model)
        post_delete.connect(recalculate_investment_on_transaction_change, sender=model)


class Investment(models.Model):
    wallet = models.ForeignKey(
        Wallet, on_delete=models.CASCADE, related_name="investments"
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=InvestmentType.choices)
    symbol = models.CharField(max_length=20, blank=True)
    created_at = models.DateField(auto_now_add=True)
    interest_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    capitalization = models.CharField(max_length=20, null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    @property
    def capital(self):
        from django.db.models import Sum

        deposits = (
            self.transactions.filter(type="deposit").aggregate(Sum("value"))[
                "value__sum"
            ]
            or 0
        )
        withdrawals = (
            self.transactions.filter(type="withdrawal").aggregate(Sum("value"))[
                "value__sum"
            ]
            or 0
        )
        return deposits + withdrawals

    def recalculate_current_values(self):
        if self.type == "deposit":
            return self.recalculate_current_values_deposit()
        elif self.type in ("stock", "fund"):
            return self.recalculate_current_values_stock()

    def recalculate_current_values_deposit(self):
        transactions = self.transactions.order_by("date", "id")
        prev_value = Decimal("0.00")
        prev_date = None

        with disable_signals_for(self.transactions.model):
            for t in transactions:
                if (
                    prev_date
                    and self.interest_rate
                    and self.capitalization == "dzienna"
                ):
                    days = (t.date - prev_date).days
                    if days > 0:
                        rate = Decimal(self.interest_rate) / 100
                        prev_value *= (Decimal("1.0") + rate / 365) ** days

                prev_value += Decimal(t.value)
                t.current_value = prev_value
                t.save(update_fields=["current_value"])
                prev_date = t.date

    def recalculate_last_transaction_deposit(self):
        """
        Przelicz tylko ostatnią transakcję: od wartości poprzedniej + kapitalizacja.
        Przydaje się np. po dodaniu nowej wpłaty/wypłaty (bez przeliczania wszystkich).
        """
        transactions = self.transactions.order_by("date", "id")
        n = transactions.count()
        if n == 0:
            return

        # Jeśli jest tylko jedna transakcja
        if n == 1:
            t = transactions.first()
            t.current_value = Decimal(t.value)
            t.save(update_fields=["current_value"])
            self.current_value = t.current_value
            self.save(update_fields=["current_value"])
            return

        # Dla więcej niż jednej: bierz przedostatnią jako punkt odniesienia
        prev_t = transactions[n - 2]
        last_t = transactions[n - 1]

        prev_value = Decimal(prev_t.current_value)
        prev_date = prev_t.date
        last_date = last_t.date

        if prev_date and self.interest_rate and self.capitalization == "dzienna":
            days = (last_date - prev_date).days
            if days > 0:
                rate = Decimal(self.interest_rate) / 100
                prev_value *= (Decimal("1.0") + rate / 365) ** days

        prev_value += Decimal(last_t.value)
        last_t.current_value = prev_value
        last_t.save(update_fields=["current_value"])
        self.current_value = prev_value
        self.save(update_fields=["current_value"])

    def recalculate_current_values_stock(self, price_lookup_func=None):
        """
        price_lookup_func: funkcja price = price_lookup_func(date)
        """
        transactions = self.transactions.order_by("date", "id")
        total_units = Decimal("0.0")
        prev_value = Decimal("0.00")

        with disable_signals_for(self.transactions.model):
            for t in transactions:
                if t.type in ("deposit", "buy"):
                    if t.units:
                        total_units += Decimal(t.units)
                elif t.type in ("withdrawal", "sell"):
                    if t.units:
                        total_units -= Decimal(t.units)
                if price_lookup_func:
                    price = Decimal(price_lookup_func(t.date))
                else:
                    price = t.purchase_price or Decimal("1.0")
                prev_value = total_units * price
                t.current_value = prev_value
                t.save(update_fields=["current_value"])
