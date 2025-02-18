# myapp/views/receipt_views.py
from rest_framework import generics
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from backend_api.models import Receipt
from backend_api.serializers import ReceiptSerializer
from backend_api.filters import ReceiptFilter


class ReceiptListCreateView(generics.ListCreateAPIView):
    queryset = Receipt.objects.all().order_by("payment_date").distinct()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReceiptFilter

    def create(self, request, *args, **kwargs):
        serializer = ReceiptSerializer(
            data=request.data, many=isinstance(request.data, list)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ReceiptSerializer(queryset, many=True)
        return Response(serializer.data)


class ReceiptUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
