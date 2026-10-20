from typing import ClassVar

from django.db import transaction
from django.db.models import Count, Exists, OuterRef
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

from common.realtime import broadcast, travel_group
from idea.models import Idea, Reaction
from idea.serializers import IdeaSerializer, ReactionSerializer
from travel.mixins import ParticipantScopedMixin
from travel.models import Step
from travel.permissions import IsTravelParticipant

# ---Idea---#


def broadcast_idea(event_type, idea):
    payload = IdeaSerializer(idea).data
    # "voted" depends on who reads it: each client keeps its own value.
    del payload["voted"]
    broadcast(travel_group(idea.travel_id), event_type, payload)


# Liste plusieurs objets (GET, POST)
class IdeaListView(ListCreateAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
        IsTravelParticipant,
    ]

    def get_queryset(self):
        user_reactions = Reaction.objects.filter(
            idea_id=OuterRef("pk"),
            traveler=self.request.user,
        )

        return (
            super()
            .get_queryset()
            .filter(travel_id=self.kwargs["travel_id"])
            .annotate(
                vote_count=Count("reactions"),
                voted=Exists(user_reactions),
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        idea = serializer.save(
            travel_id=self.kwargs["travel_id"],
            traveler=self.request.user,
        )
        broadcast_idea("idea.created", idea)


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

    def perform_update(self, serializer):
        broadcast_idea("idea.updated", serializer.save())

    def perform_destroy(self, instance):
        payload = {"id": instance.id}
        group = travel_group(instance.travel_id)
        instance.delete()
        broadcast(group, "idea.deleted", payload)


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

    # Requete sql ciblée
    @transaction.atomic
    def post(self, request, travel_id, pk):
        idea = self.get_object()

        # Si l’hébergement n’a pas déjà été choisi
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
            broadcast_idea("idea.updated", idea)

        return Response(
            self.get_serializer(idea).data,
            status=status.HTTP_200_OK,
        )


# ========================================================================#

# ---Reaction---#


def broadcast_reaction(event_type, idea, traveler):
    broadcast(
        travel_group(idea.travel_id),
        event_type,
        {
            "idea_id": idea.id,
            "traveler_id": traveler.id,
            # Counted before the commit: the next REST reload fixes any drift.
            "vote_count": idea.reactions.count(),
        },
    )


# Réagir à une idée du voyage (POST/DELETE)
class ReactionView(ParticipantScopedMixin, GenericAPIView):
    queryset = Idea.objects.all()
    serializer_class = ReactionSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def get(self, request, travel_id, pk):
        idea = self.get_object()

        reactions = idea.reactions.order_by("created_at", "pk")
        serializer = self.get_serializer(reactions, many=True)

        return Response(serializer.data)

    def post(self, request, travel_id, pk):
        idea = self.get_object()

        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)
        serializer.save(
            traveler=request.user,
            idea=idea,
        )
        broadcast_reaction("reaction.created", idea, request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, travel_id, pk):
        idea = self.get_object()

        deleted, _ = idea.reactions.filter(
            traveler=request.user,
        ).delete()
        if deleted:
            broadcast_reaction("reaction.deleted", idea, request.user)

        return Response(status=status.HTTP_204_NO_CONTENT)
