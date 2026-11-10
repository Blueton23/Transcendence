from typing import ClassVar

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import Message, SystemMessageKey
from chat.services import post_system_message
from common.mixins import PublicApiMixin
from common.realtime import broadcast, travel_group
from idea.models import Idea
from traveler.models import Friendship, Status, Traveler

from .consumers import kick_from_travel
from .mixins import ParticipantScopedMixin
from .models import Participation, ParticipationStatus, Step, Travel
from .permissions import IsTravelParticipant
from .schema import (
    step_detail_schema,
    steps_list_schema,
    travel_detail_schema,
    travels_list_schema,
)
from .serializers import StepSerializer, TravelSerializer


def get_invited_travel(token):
    try:
        return Travel.objects.get(invite_token=token)
    except Travel.DoesNotExist as exc:
        raise NotFound(
            "Invalid invitation link.",
            code="invalid_invitation_link",
        ) from exc


class TravelJoinView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request, token):
        travel = get_invited_travel(token)
        data = TravelSerializer(travel).data
        data["is_member"] = travel.participations.filter(
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()
        return Response(data)

    def post(self, request, token):
        travel = get_invited_travel(token)
        with transaction.atomic():
            participation, _ = Participation.objects.select_for_update().get_or_create(
                traveler=request.user, travel=travel
            )
            # Opening the invite link again as a member changes nothing.
            if participation.status != ParticipationStatus.ACCEPTED:
                participation.accept()
                announce_participant(travel.id, request.user, "joined")
        return Response(TravelSerializer(travel).data)


class AddParticipantView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated, IsTravelParticipant]

    def post(self, request, travel_id):
        friend = get_object_or_404(Traveler, pk=request.data.get("traveler_id"))

        is_friend = Friendship.objects.filter(
            Q(user1=request.user, user2=friend) | Q(user1=friend, user2=request.user),
            status=Status.ACCEPTED,
        ).exists()
        if not is_friend:
            raise ValidationError(
                "This traveler is not your friend.", code="not_friend"
            )
        with transaction.atomic():
            participation, _ = Participation.objects.select_for_update().get_or_create(
                traveler=friend, travel_id=travel_id
            )
            # Adding someone who is already a member changes nothing.
            if participation.status != ParticipationStatus.ACCEPTED:
                participation.accept()
                announce_participant(travel_id, friend, "joined")
        return Response(status=status.HTTP_204_NO_CONTENT)


PARTICIPANT_MESSAGES = {
    "joined": SystemMessageKey.PARTICIPANT_JOINED,
    "left": SystemMessageKey.PARTICIPANT_LEFT,
}


def announce_participant(travel_id, traveler, action):
    """Tells the travel that someone joined or left: a system message in the
    chat, and `participant.<action>` so open pages reload the travelers."""
    post_system_message(
        travel_id, PARTICIPANT_MESSAGES[action], {"name": traveler.username}
    )
    broadcast(
        travel_group(travel_id),
        f"participant.{action}",
        {"traveler_id": traveler.id},
    )


@extend_schema(tags=["Travels"])
@travels_list_schema
class TravelListView(PublicApiMixin, ParticipantScopedMixin, ListCreateAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            travel = serializer.save()
            Participation.objects.create(
                traveler=self.request.user,
                travel=travel,
                status=ParticipationStatus.ACCEPTED,
            )


@extend_schema(tags=["Travels"])
@travel_detail_schema
class TravelDetailView(PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer

    def perform_update(self, serializer):
        travel = serializer.save()
        broadcast(
            travel_group(travel.id), "travel.updated", TravelSerializer(travel).data
        )


def broadcast_step(event_type, step):
    broadcast(travel_group(step.travel_id), event_type, StepSerializer(step).data)


@extend_schema(tags=["Steps"])
@steps_list_schema
class StepListView(PublicApiMixin, ListCreateAPIView):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    permission_classes: ClassVar[list] = [IsAuthenticated, IsTravelParticipant]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_create(self, serializer):
        broadcast_step(
            "step.created", serializer.save(travel_id=self.kwargs["travel_id"])
        )


@extend_schema(tags=["Steps"])
@step_detail_schema
class StepDetailView(
    PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateDestroyAPIView
):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    participation_path = "travel__participations"

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_update(self, serializer):
        broadcast_step("step.updated", serializer.save())

    def perform_destroy(self, instance):
        if instance.spendings.exists():
            raise ValidationError(
                "This stop has expenses: move or delete them first",
                code="step_has_spending",
            )
        instance.soft_delete()
        # Ideas placed on this step go back to the pool: clients refetch them.
        broadcast(travel_group(instance.travel_id), "step.deleted", {"id": instance.id})
        # TODO: message system a rajouter dans la chat + bouton "restaurer"une fois l-app chat prete


class LeaveTravelView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, travel_id):
        # Locked so two leave requests at once announce it only once.
        participation = get_object_or_404(
            Participation.objects.select_for_update(),
            travel_id=travel_id,
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        )
        participation.status = ParticipationStatus.LEFT
        participation.left_at = timezone.now()
        participation.save()
        announce_participant(travel_id, request.user, "left")
        kick_from_travel(travel_id, request.user.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TravelNotificationsView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request):
        participations = Participation.objects.filter(
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        ).select_related("travel")
        data = []
        for participation in participations:
            messages = Message.objects.unread_for(participation).count()
            ideas = Idea.objects.unseen_for(participation).count()
            if messages or ideas:
                data.append(
                    {
                        "travel_id": participation.travel_id,
                        "travel_title": participation.travel.title,
                        "unread_messages": messages,
                        "unseen_ideas": ideas,
                    }
                )
        return Response(data)
