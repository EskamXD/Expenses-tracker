from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r"transactions", views.TransactionView, basename="transactions")
router.register(r"receipts", views.ReceiptView, basename="receipts")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/receipts/", views.ReceiptCreateView.as_view(), name="receipt-create"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/monthly-balance/", views.monthly_balance, name="monthly-balance"),
    path(
        "api/fetch-line-sums/",
        views.fetch_line_sums,
        name="fetch-line-sums",
    ),
    path("api/fetch-bar-persons/", views.fetch_bar_persons, name="fetch-bar-persons"),
    path("api/fetch-bar-shops/", views.fetch_bar_shops, name="fetch-bar-shops"),
    path(
        "api/fetch-pie-categories/",
        views.fetch_pie_categories,
        name="fetch-pie-categories",
    ),
    # other paths
]
