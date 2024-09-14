from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet, ItemViewSet, ReceiptViewSet

router = DefaultRouter()
router.register(r"person", PersonViewSet)
router.register(r"items", ItemViewSet)
router.register(r"receipts", ReceiptViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
