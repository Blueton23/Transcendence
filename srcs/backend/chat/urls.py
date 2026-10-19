
from django.urls import path

from .views import TravelMessageListCreateView

urlpatterns = [
    path(
        "<int:travel_id>/messages/",
        TravelMessageListCreateView.as_view(),
        name="travel-messages",
    ),
]
