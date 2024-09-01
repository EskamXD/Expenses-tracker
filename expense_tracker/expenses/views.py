from django.shortcuts import render

# import view sets from the REST framework
from rest_framework import viewsets

# import the ExpenseSerializer from the serializer file
from .serializers import ExpenseSerializer
from .serializers import IncomeSerializer
from .serializers import SummarySerializer

# import the Expense model from the models file
from .models import Expense
from .models import Income
from .models import Summary


# create a class for the Todo model viewsets
class ExpenseView(viewsets.ModelViewSet):
    # create a serializer class and
    # assign it to the ExpenseSerializer class
    serializer_class = ExpenseSerializer

    # define a variable and populate it
    # with the Expense list objects
    queryset = Expense.objects.all()


class IncomeView(viewsets.ModelViewSet):
    # create a serializer class and
    # assign it to the ExpenseSerializer class
    serializer_class = IncomeSerializer

    # define a variable and populate it
    # with the Expense list objects
    queryset = Income.objects.all()


class SummaryView(viewsets.ModelViewSet):
    # create a serializer class and
    # assign it to the ExpenseSerializer class
    serializer_class = SummarySerializer

    # define a variable and populate it
    # with the Expense list objects
    queryset = Summary.objects.all()
