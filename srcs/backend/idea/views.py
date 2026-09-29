from typing import ClassVar

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from idea.models import Idea
from idea.serializers import IdeaSerializer, ReactionSerializer
from travel.mixins import ParticipantScopedMixin
from travel.models import Step
from travel.permissions import IsTravelParticipant

# ---Idea---#


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


# Choisir un hébergement placé sur une étape (POST)
class IdeaChoiceView(ParticipantScopedMixin, GenericAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(travel_id=self.kwargs["travel_id"])
            .select_for_update(of=("self",))
        )

    @transaction.atomic
    def post(self, request, travel_id, pk):
        idea = self.get_object()

        if idea.chosen_at is None:
            if idea.step_id is not None:
                idea.step = get_object_or_404(
                    Step.objects.select_for_update(),
                    pk=idea.step_id,
                )

            serializer = self.get_serializer(
                idea,
                data={},
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(
                chosen_by=request.user,
                chosen_at=timezone.now(),
            )

        return Response(
            self.get_serializer(idea).data,
            status=status.HTTP_200_OK,
        )


# ========================================================================#

# ---Reaction---#


# Réagir à une idée du voyage (POST/DELETE)
class ReactionView(ParticipantScopedMixin, GenericAPIView):
    queryset = Idea.objects.all()
    serializer_class = ReactionSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def post(self, request, travel_id, pk):
        idea = self.get_object()

        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)
        serializer.save(
            traveler=request.user,
            idea=idea,
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, travel_id, pk):
        idea = self.get_object()

        idea.reactions.filter(
            traveler=request.user,
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
