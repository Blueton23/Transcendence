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

from common.mixins import PublicApiMixin

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
        Participation.objects.update_or_create(
            traveler=request.user,
            travel=travel,
            defaults={"status": ParticipationStatus.ACCEPTED, "left_at": None},
        )
        return Response(TravelSerializer(travel).data)


@extend_schema(tags=["Travels list"])
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


@extend_schema(tags=["Travel detail"])
@travel_detail_schema
class TravelDetailView(PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer


@extend_schema(tags=["Steps list"])
@steps_list_schema
class StepListView(PublicApiMixin, ListCreateAPIView):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    permission_classes: ClassVar[list] = [IsAuthenticated, IsTravelParticipant]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_create(self, serializer):
        serializer.save(travel_id=self.kwargs["travel_id"])


@extend_schema(tags=["Step detail"])
@step_detail_schema
class StepDetailView(
    PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateDestroyAPIView
):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    participation_path = "travel__participations"

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_destroy(self, instance):
        instance.soft_delete()
        # TODO: message system a rajouter dans la chat + bouton "restaurer"une fois l-app chat prete


class LeaveTravelView(APIView):
    permission_classes: ClassVar[list] = [IsAuthenticated]

    def post(self, request, travel_id):
        participation = get_object_or_404(
            Participation,
            travel_id=travel_id,
            traveler=request.user,
            status=ParticipationStatus.ACCEPTED,
        )
        participation.status = ParticipationStatus.LEFT
        participation.left_at = timezone.now()
        participation.save()
        # TODO: message system a rajouter dans la chat + bouton "restaurer"une fois l-app chat prete
        return Response(status=status.HTTP_204_NO_CONTENT)
