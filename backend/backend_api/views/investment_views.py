from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from backend_api.filters import InvestmentFilter
from backend_api.models import Wallet, Investment, InvestmentTransaction
from backend_api.serializers import (
    WalletSerializer,
    InvestmentSerializer,
    InvestmentTransactionSerializer,
)


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = InvestmentFilter

    @action(detail=True, methods=["get"])
    def current_value(self, request, pk=None):
        """
        Endpoint GET /api/investments/{id}/current_value/
        Zwraca bieżącą wartość inwestycji (kapitał, zysk, aktualna wartość)
        """
        investment = self.get_object()
        result = {
            "capital": investment.capital,
            "current_value": investment.current_value,
        }
        return Response(result)


class InvestmentTransactionViewSet(viewsets.ModelViewSet):
    queryset = InvestmentTransaction.objects.all()
    serializer_class = InvestmentTransactionSerializer
