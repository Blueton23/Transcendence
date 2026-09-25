from typing import ClassVar

from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from idea.models import Idea
from idea.serializers import IdeaSerializer
from travel.permissions import IsTravelParticipant


class IdeaListView(ListCreateAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
        IsTravelParticipant,
    ]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_create(self, serializer):
        serializer.save(
            travel_id=self.kwargs["travel_id"],
            traveler=self.request.user,
        )
