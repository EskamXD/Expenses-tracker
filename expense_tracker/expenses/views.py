from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction, Receipt
from .serializers import TransactionSerializer, ReceiptSerializer
from .filters import TransactionFilter, ReceiptFilter


class TransactionView(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransactionFilter


class ReceiptCreateView(generics.CreateAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer


class ReceiptView(viewsets.ModelViewSet):
    queryset = Receipt.objects.all().distinct()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReceiptFilter
