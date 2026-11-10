from django.urls import path

from .views import (
    AddParticipantView,
    LeaveTravelView,
    RefuseInvitationView,
    StepDetailView,
    StepListView,
    TravelDetailView,
    TravelInvitationsView,
    TravelJoinView,
    TravelListView,
    TravelNotificationsView,
)

urlpatterns = [
    path("", TravelListView.as_view(), name="travel-list"),
    path("<int:pk>/", TravelDetailView.as_view(), name="travel-detail"),
    path("join/<str:token>/", TravelJoinView.as_view(), name="travel-join"),
    path(
        "join/<str:token>/refuse/",
        RefuseInvitationView.as_view(),
        name="travel-refuse-invitation",
    ),
    path("invitations/", TravelInvitationsView.as_view(), name="travel-invitations"),
    path(
        "<int:travel_id>/participants/",
        AddParticipantView.as_view(),
        name="travel-add-participant",
    ),
    path("<int:travel_id>/steps/", StepListView.as_view(), name="step-list"),
    path(
        "<int:travel_id>/steps/<int:pk>/", StepDetailView.as_view(), name="step-detail"
    ),
    path("<int:travel_id>/leave/", LeaveTravelView.as_view(), name="travel-leave"),
    path(
        "notifications/", TravelNotificationsView.as_view(), name="travel-notifications"
    ),
]
