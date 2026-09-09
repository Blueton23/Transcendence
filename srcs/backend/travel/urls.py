from django.urls import path

from .views import TravelListCreateView

urlpatterns = [
    path("", TravelListCreateView.as_view(), name="travel-list-create"),
]

