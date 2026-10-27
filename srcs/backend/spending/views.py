from typing import ClassVar

from drf_spectacular.utils import extend_schema
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated

from common.mixins import PublicApiMixin
from spending.models import Spending
from spending.serializers import SpendingSerializer
from travel.mixins import ParticipantScopedMixin
from travel.permissions import IsTravelParticipant


@extend_schema(tags=["Spendings"])
class SpendingListView(PublicApiMixin, ListCreateAPIView):
    queryset = Spending.objects.all()
    serializer_class = SpendingSerializer
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
        IsTravelParticipant,
    ]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(travel_id=self.kwargs["travel_id"])
            .prefetch_related("shares")
        )

    def perform_create(self, serializer):
        serializer.save(
            travel_id=self.kwargs["travel_id"],
        )


@extend_schema(tags=["Spendings"])
class SpendingDetailView(
    PublicApiMixin, ParticipantScopedMixin, RetrieveUpdateDestroyAPIView
):
    queryset = Spending.objects.all()
    serializer_class = SpendingSerializer
    participation_path = "travel__participations"
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return super().get_queryset().filter(travel_id=self.kwargs["travel_id"])
