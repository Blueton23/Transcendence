from typing import ClassVar

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.mixins import PublicApiMixin
from spending.models import Spending
from spending.serializers import SpendingSerializer
from spending.services import compute_balances, compute_settlements
from travel.mixins import ParticipantScopedMixin
from travel.models import Travel
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


class SpendingSummaryView(APIView, PublicApiMixin):
    permission_classes: ClassVar[list] = [
        IsAuthenticated,
        IsTravelParticipant,
    ]

    def get(self, request, travel_id):
        travel = get_object_or_404(Travel, pk=travel_id)
        by_category = (
            Spending.objects.filter(travel=travel)
            .values("category")
            .annotate(total=Sum("amount"))
        )
        balances = compute_balances(travel)
        settlements = compute_settlements(travel)
        data = {
            "total": sum(row["total"] for row in by_category),
            "by_category": by_category,
            "balances": [
                {
                    "traveler_id": b.traveler.pk,
                    "paid": b.paid,
                    "owed": b.owed,
                    "balance": b.balance,
                }
                for b in balances
            ],
            "settlements": [
                {
                    "debtor_id": s.debtor.pk,
                    "creditor_id": s.creditor.pk,
                    "amount": s.amount,
                }
                for s in settlements
            ],
        }

        return Response(data)
