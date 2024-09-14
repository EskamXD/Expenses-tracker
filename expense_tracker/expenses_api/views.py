from rest_framework import viewsets
from .models import Person, Item, Receipt
from .serializers import (
    PersonSerializer,
    ItemSerializer,
    ReceiptSerializer,
)

# Create your views here.


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
