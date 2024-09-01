from django.urls import path, include
from rest_framework import routers
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from . import views


# create a router object
router = routers.DefaultRouter()

# register the router
router.register(r"expenses", views.ExpensesView, "expenses")
router.register(r"income", views.IncomeView, "income")
router.register(r"summary", views.SummaryView, "summary")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/receipt/", views.ReceiptCreateView.as_view(), name="receipt-create"),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
