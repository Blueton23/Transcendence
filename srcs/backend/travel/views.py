from typing import ClassVar

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.services import post_system_message
from common.mixins import PublicApiMixin
from common.realtime import broadcast, travel_group

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


class TravelJoinView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def get(self, request, token):
        travel = get_object_or_404(Travel, invite_token=token)
        data = TravelSerializer(travel).data
        data["is_member"] = travel.participations.filter(
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        ).exists()
        return Response(data)

    def post(self, request, token):
        travel = get_object_or_404(Travel, invite_token=token)
        with transaction.atomic():
            participation, created = (
                Participation.objects.select_for_update().get_or_create(
                    traveler=request.user,
                    travel=travel,
                    defaults={"status": ParticipationStatus.ACCEPTED},
                )
            )
            # Opening the invite link again as a member changes nothing.
            if created or participation.status != ParticipationStatus.ACCEPTED:
                participation.status = ParticipationStatus.ACCEPTED
                participation.left_at = None
                participation.save()
                announce_participant(travel.id, request.user, "joined")
        return Response(TravelSerializer(travel).data)


PARTICIPANT_MESSAGES = {
    "joined": "{name} a rejoint le voyage.",
    "left": "{name} a quitté le voyage.",
}


def announce_participant(travel_id, traveler, action):
    """Tells the travel that someone joined or left: a system message in the
    chat, and `participant.<action>` so open pages reload the travelers."""
    post_system_message(
        travel_id, PARTICIPANT_MESSAGES[action].format(name=traveler.username)
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
