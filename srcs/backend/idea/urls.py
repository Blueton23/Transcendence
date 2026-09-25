from django.urls import path

from .views import (
    IdeaListView,
)

urlpatterns = [path("<int:travel_id>/ideas/", IdeaListView.as_view(), name="idea-list")]
