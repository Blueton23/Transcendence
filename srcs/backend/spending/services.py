from collections.abc import Iterable, Mapping
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction

from travel.models import ParticipationStatus

from .models import Spending, SpendingShare

CENT = Decimal("0.01")


def split_equally(amount: Decimal, travelers: Iterable) -> dict:

    travelers = sorted(travelers, key=lambda traveler: traveler.pk)
    if not travelers:
        raise ValidationError(
            {"shares": "At least one traveler must share the spending."}
        )

    cents = int(Decimal(amount).quantize(CENT) / CENT)
    base, remainder = divmod(cents, len(travelers))
    return {
        traveler: (base + (1 if index < remainder else 0)) * CENT
        for index, traveler in enumerate(travelers)
    }


def accepted_travelers(travel) -> list:
    return [
        participation.traveler
        for participation in travel.participations.filter(
            status=ParticipationStatus.ACCEPTED
        ).select_related("traveler")
    ]


@transaction.atomic
def set_shares(spending: Spending, shares: Mapping) -> list[SpendingShare]:

    if not shares:
        raise ValidationError(
            {"shares": "At least one traveler must share the spending."}
        )

    total = sum((Decimal(amount) for amount in shares.values()), Decimal(0))
    if total.quantize(CENT) != Decimal(spending.amount).quantize(CENT):
        raise ValidationError(
            {
                "shares": f"The shares total ({total}) must equal "
                f"the spending amount ({spending.amount})."
            }
        )

    spending.shares.all().delete()
    return [
        SpendingShare.objects.create(
            spending=spending, traveler=traveler, amount=amount
        )
        for traveler, amount in shares.items()
    ]


@transaction.atomic
def create_spending(*, shares: Mapping | None = None, **fields: object) -> Spending:

    spending = Spending.objects.create(**fields)
    if shares is None:
        shares = split_equally(spending.amount, accepted_travelers(spending.travel))
    set_shares(spending, shares)
    return spending


@transaction.atomic
def update_spending(
    spending: Spending, *, shares: Mapping | None = None, **fields: object
) -> Spending:

    previous_amount = spending.amount
    for name, value in fields.items():
        setattr(spending, name, value)
    spending.save()

    if shares is None and Decimal(spending.amount) != Decimal(previous_amount):
        current = [
            share.traveler for share in spending.shares.select_related("traveler")
        ]
        # Depense creee avant les parts : on retombe sur le partage par defaut.
        shares = split_equally(
            spending.amount, current or accepted_travelers(spending.travel)
        )
    if shares is not None:
        set_shares(spending, shares)
    return spending
