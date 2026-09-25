from typing import ClassVar

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from idea.models import Idea
from idea.serializers import IdeaSerializer
from travel.mixins import ParticipantScopedMixin
from travel.permissions import IsTravelParticipant


# Liste plusieurs objets (GET, POST)
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


# Récupérer un seul objet (GET, PATCH, PUT, DELETE)
class IdeaDetailView(ParticipantScopedMixin, RetrieveUpdateDestroyAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])
