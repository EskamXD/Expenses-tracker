from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from backend_api.models import Receipt


class DuplicateReceiptDebugView(APIView):
    """
    Widok debugujący sprawdzający zduplikowane paragony
    na podstawie tych samych pól (bez ID).
    """

    def get(self, request, *args, **kwargs):
        # Znajdowanie zduplikowanych paragonów na podstawie pól innych niż ID
        duplicates = (
            Receipt.objects.values("payment_date", "payer", "shop", "transaction_type")
            .annotate(count=Count("*"))
            .filter(count__gt=1)
        )

        if duplicates.exists():
            return Response(
                {
                    "status": "Duplikaty znalezione",
                    "duplicates": list(duplicates),
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {
                    "status": "Brak duplikatów",
                },
                status=status.HTTP_200_OK
            )
