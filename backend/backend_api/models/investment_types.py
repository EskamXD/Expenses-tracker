from django.db import models


class InvestmentType(models.TextChoices):
    DEPOSIT = "deposit", "Lokata"
    FUND = "fund", "Fundusz"
    STOCK = "stock", "Akcja"
    ETF = "etf", "ETF"
    BOND = "bond", "Obligacja"
