from django.urls import path

from .views import StepDetailView, StepListView, TravelDetailView, TravelListView

urlpatterns = [
    path("", TravelListView.as_view(), name="travel-list"),
    path("<int:pk>/", TravelDetailView.as_view(), name="travel-detail"),
    path("<int:travel_id>/steps/", StepListView.as_view(), name="step-list"),
    path(
        "<int:travel_id>/steps/<int:pk>/", StepDetailView.as_view(), name="step-detail"
    ),
]
