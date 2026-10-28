from django.urls import path

from .views import SpendingDetailView, SpendingListView, SpendingSummaryView

urlpatterns = [
    path(
        "<int:travel_id>/spendings/", SpendingListView.as_view(), name="spending-list"
    ),
    path(
        "<int:travel_id>/spendings/<int:pk>/",
        SpendingDetailView.as_view(),
        name="spending-detail",
    ),
    path(
        "<int:travel_id>/spendings/summary/",
        SpendingSummaryView.as_view(),
        name="spending-summary",
    ),
]
