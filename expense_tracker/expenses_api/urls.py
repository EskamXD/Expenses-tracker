from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from .views import (
    PersonViewSet,
    ItemViewSet,
    ReceiptListCreateView,
    ReceiptUpdateDestroyView,
    fetch_line_sums,
    fetch_bar_persons,
    fetch_bar_shops,
    fetch_pie_categories,
    is_monthly_balance_saved,
)

router = DefaultRouter()

router.register(r"person", PersonViewSet)
router.register(r"items", ItemViewSet)
# router.register(r"receipts", ReceiptViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("receipts/", ReceiptListCreateView.as_view(), name="receipt-create"),
    path(
        "receipts/<int:pk>/", ReceiptUpdateDestroyView.as_view(), name="receipt-update"
    ),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("fetch/line-sums/", fetch_line_sums, name="fetch-line-sums"),
    path("fetch/bar-persons/", fetch_bar_persons, name="fetch-bar-persons"),
    path("fetch/bar-shops/", fetch_bar_shops, name="fetch-bar-shops"),
    path("fetch/pie-categories/", fetch_pie_categories, name="fetch-pie-categories"),
    path(
        "fetch/is-monthly-balance-saved/",
        is_monthly_balance_saved,
        name="is-monthly-balance-saved",
    ),
]
