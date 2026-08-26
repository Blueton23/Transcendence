from django.urls import path

from .views import ApiHealthView, TravelerCreateView, TravelerPingView

urlpatterns = [
    path("", ApiHealthView.as_view(), name="api-health"),
    path("ping/", TravelerPingView.as_view(), name="traveler-ping"),
    path("travelers/", TravelerCreateView.as_view(), name="traveler-create"),
]