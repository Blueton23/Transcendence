from django.urls import path

from .views import (
    TravelMarkReadView,
    TravelMessageListCreateView,
    TravelUnreadCountView,
)

urlpatterns = [
    path(
        "<int:travel_id>/messages/",
        TravelMessageListCreateView.as_view(),
        name="travel-messages",
    ),
    path(
        "<int:travel_id>/messages/unread-count/",
        TravelUnreadCountView.as_view(),
        name="travel-unread-count",
    ),
    path(
        "<int:travel_id>/messages/mark-read/",
        TravelMarkReadView.as_view(),
        name="travel-mark-read",
    ),
]
