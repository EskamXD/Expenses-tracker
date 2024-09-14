# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from . import views
# from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# router = DefaultRouter()
# router.register(r"users", views.UserViewSet, basename="users")
# router.register(r"groups", views.GroupsViewSet, basename="groups")
# router.register(r"transactions", views.TransactionViewSet, basename="transactions")
# router.register(r"receipts", views.ReceiptViewSet, basename="receipts")

# urlpatterns = [
#     path("", include(router.urls)),
#     # path("api/receipts/", views.ReceiptCreateView.as_view(), name="receipt-create"),
#     path("schema/", SpectacularAPIView.as_view(), name="schema"),
#     path(
#         "schema/swagger-ui/",
#         SpectacularSwaggerView.as_view(url_name="schema"),
#         name="swagger-ui",
#     ),
#     path("apmonthly-balance/", views.monthly_balance, name="monthly-balance"),
#     path(
#         "fetch-line-sums/",
#         views.fetch_line_sums,
#         name="fetch-line-sums",
#     ),
#     path("fetch-bar-persons/", views.fetch_bar_persons, name="fetch-bar-persons"),
#     path("fetch-bar-shops/", views.fetch_bar_shops, name="fetch-bar-shops"),
#     path(
#         "fetch-pie-categories/",
#         views.fetch_pie_categories,
#         name="fetch-pie-categories",
#     ),
#     path("bills/", views.bills, name="bills"),
#     # other paths
# ]
