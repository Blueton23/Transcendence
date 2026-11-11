from django.urls import path

from .views import (
    IdeaChoiceView,
    IdeaDetailView,
    IdeaListView,
    IdeaMarkSeenView,
    IdeaUnseenCountView,
    ReactionView,
)

urlpatterns = [
    path("<int:travel_id>/ideas/", IdeaListView.as_view(), name="idea-list"),
    path(
        "<int:travel_id>/ideas/unseen-count/",
        IdeaUnseenCountView.as_view(),
        name="idea-unseen-count",
    ),
    path(
        "<int:travel_id>/ideas/mark-seen/",
        IdeaMarkSeenView.as_view(),
        name="idea-mark-seen",
    ),
    path(
        "<int:travel_id>/ideas/<int:pk>/",
        IdeaDetailView.as_view(),
        name="idea-detail",
    ),
    path(
        "<int:travel_id>/ideas/<int:pk>/choice/",
        IdeaChoiceView.as_view(),
        name="idea-choice",
    ),
    path(
        "<int:travel_id>/ideas/<int:pk>/reaction/",
        ReactionView.as_view(),
        name="idea-reaction",
    ),
]
