from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import (
    InvestmentTransaction,
)  # lub .investment_transactions import InvestmentTransaction
import logging

logger = logging.getLogger(__name__)


@receiver([post_save, post_delete], sender=InvestmentTransaction)
def recalculate_investment_on_transaction_change(sender, instance, **kwargs):
    print("SIGNAL FIRED!!!", instance)
    logger.warning("SIGNAL fired for %s", instance)

    investment = instance.investment
    if hasattr(investment, "recalculate_current_values"):
        investment.recalculate_last_transaction_deposit()
