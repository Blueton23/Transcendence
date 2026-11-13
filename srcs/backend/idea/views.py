from typing import ClassVar

from django.db import transaction
from django.db.models import Count, Exists, OuterRef
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import SystemMessageKey
from chat.services import announce_activity
from common.mixins import PublicApiMixin
from common.realtime import broadcast, travel_group
from idea.models import Idea, Reaction
from idea.serializers import IdeaSerializer, ReactionSerializer
from travel.activity import notify_travel_activity
from travel.mixins import ParticipantScopedMixin
from travel.models import Participation, ParticipationStatus, Step
from travel.permissions import IsTravelParticipant

from .schema import idea_detail_schema, ideas_list_schema

# ---Idea---#


def broadcast_idea(event_type, idea):
    payload = IdeaSerializer(idea).data
    # "voted" depends on who reads it: each client keeps its own value.
    del payload["voted"]
    broadcast(travel_group(idea.travel_id), event_type, payload)


def announce_idea(user, key, idea):
    announce_activity(idea.travel_id, user, key, {"title": idea.title})


# Liste plusieurs objets (GET, POST)
@extend_schema(tags=["Ideas"])
@ideas_list_schema
class IdeaListView(PublicApiMixin, ListCreateAPIView):
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
        announce_idea(self.request.user, SystemMessageKey.IDEA_CREATED, idea)
        notify_travel_activity(idea.travel_id, self.request.user.id)


# Récupérer un seul objet (GET, PATCH, PUT, DELETE)
@extend_schema(tags=["Ideas"])
@idea_detail_schema
class IdeaDetailView(
    PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateDestroyAPIView
):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_update(self, serializer):
        previous_title = serializer.instance.title
        idea = serializer.save()
        broadcast_idea("idea.updated", idea)
        announce_activity(
            idea.travel_id,
            self.request.user,
            SystemMessageKey.IDEA_UPDATED,
            {"title": previous_title},
        )

    def perform_destroy(self, instance):
        payload = {"id": instance.id}
        travel_id = instance.travel_id
        instance.delete()
        broadcast(travel_group(travel_id), "idea.deleted", payload)
        announce_idea(self.request.user, SystemMessageKey.IDEA_DELETED, instance)
        # An unseen idea may be gone: the others' counts have to reload.
        notify_travel_activity(travel_id, self.request.user.id)


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
            announce_idea(request.user, SystemMessageKey.IDEA_CHOSEN, idea)

        return Response(
            self.get_serializer(idea).data,
            status=status.HTTP_200_OK,
        )


# Nouvelles idées depuis le dernier passage sur la page (badge du menu)
class IdeaSeenMixin:
    permission_classes: ClassVar[list] = [IsAuthenticated, IsTravelParticipant]

    def get_participation(self):
        return Participation.objects.get(
            travel_id=self.kwargs["travel_id"],
            traveler=self.request.user,
            status=ParticipationStatus.ACCEPTED,
        )


class IdeaUnseenCountView(IdeaSeenMixin, APIView):
    def get(self, request, travel_id):
        count = Idea.objects.unseen_for(self.get_participation()).count()
        return Response({"unseen_count": count})


class IdeaMarkSeenView(IdeaSeenMixin, APIView):
    def post(self, request, travel_id):
        self.get_participation().mark_ideas_seen()
        return Response({"success": True})


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
