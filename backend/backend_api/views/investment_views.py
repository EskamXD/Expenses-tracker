from rest_framework import viewsets
from backend_api.models import Instrument, Invest, Wallet, WalletSnapshot
from backend_api.serializers import (
    InstrumentSerializer,
    InvestSerializer,
    WalletSerializer,
    WalletSnapshotSerializer,
)


class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer


class InvestViewSet(viewsets.ModelViewSet):
    queryset = Invest.objects.all()
    serializer_class = InvestSerializer

class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer

class WalletSnapshotViewSet(viewsets.ModelViewSet):
    queryset = WalletSnapshot.objects.all()
    serializer_class = WalletSnapshotSerializer
