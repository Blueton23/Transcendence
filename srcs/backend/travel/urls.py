from django.urls import path

from .views import (
    LeaveTravelView,
    StepDetailView,
    StepListView,
    TravelDetailView,
    TravelListView,
    TravelJoinView,
)

urlpatterns = [
    path("", TravelListView.as_view(), name="travel-list"),
    path("<int:pk>/", TravelDetailView.as_view(), name="travel-detail"),
    path("join/<str:token>/", TravelJoinView.as_view(), name="travel-join"),
    path("<int:travel_id>/steps/", StepListView.as_view(), name="step-list"),
    path(
        "<int:travel_id>/steps/<int:pk>/", StepDetailView.as_view(), name="step-detail"
    ),
    path("<int:travel_id>/leave/", LeaveTravelView.as_view(), name="travel-leave"),
]
