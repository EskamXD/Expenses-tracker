# myapp/views/item_views.py
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from backend_api.models import Item
from backend_api.serializers import ItemSerializer
from backend_api.filters import ItemFilter  # zakładamy, że masz filtr ItemFilter


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ItemFilter
