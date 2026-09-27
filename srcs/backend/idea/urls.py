from django.urls import path

from .views import (
    IdeaChoiceView,
    IdeaDetailView,
    IdeaListView,
)

urlpatterns = [
    path("<int:travel_id>/ideas/", IdeaListView.as_view(), name="idea-list"),
    path(
        "<int:travel_id>/ideas/<int:pk>/", IdeaDetailView.as_view(), name="idea-detail"
    ),
    path(
        "<int:travel_id>/ideas/<int:pk>/choice/",
        IdeaChoiceView.as_view(),
        name="idea-choice",
    ),
]
