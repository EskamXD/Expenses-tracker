from django.shortcuts import render
from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend


from .serializers import ExpensesSerializer, IncomeSerializer, SummarySerializer, ReceiptSerializer
from .models import Expenses, Income, Summary, Receipt
from .filters import ExpensesFilter


# create a class for the Todo model viewsets
class ExpensesView(viewsets.ModelViewSet):
    queryset = Expenses.objects.all()
    serializer_class = ExpensesSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ExpensesFilter

class IncomeView(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

class SummaryView(viewsets.ModelViewSet):
    queryset = Summary.objects.all()
    serializer_class = SummarySerializer
class ReceiptCreateView(generics.CreateAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer

