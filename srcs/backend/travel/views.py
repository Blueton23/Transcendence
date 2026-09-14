from typing import ClassVar

from django.db import transaction
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated

from .mixins import ParticipantScopedMixin
from .models import Participation, ParticipationStatus, Step, Travel
from .permissions import IsTravelParticipant
from .serializers import StepSerializer, TravelSerializer


class TravelListView(ParticipantScopedMixin, ListCreateAPIView):
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


class TravelDetailView(ParticipantScopedMixin, RetrieveUpdateAPIView):
    queryset = Travel.objects.all()
    serializer_class = TravelSerializer


class StepListView(ListCreateAPIView):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    permission_classes: ClassVar[list] = [IsAuthenticated, IsTravelParticipant]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_create(self, serializer):
        serializer.save(travel_id=self.kwargs["travel_id"])


class StepDetailView(ParticipantScopedMixin, RetrieveUpdateDestroyAPIView):
    queryset = Step.objects.alive()
    serializer_class = StepSerializer
    participation_path = "travel__participations"

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])

    def perform_destroy(self, instance):
        instance.soft_delete()
