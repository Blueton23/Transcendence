from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Sum

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


@dataclass(frozen=True)
class TravelerBalance:
    traveler: object
    paid: Decimal
    owed: Decimal

    @property
    def balance(self) -> Decimal:
        """> 0 : les autres lui doivent de l'argent, < 0 : il doit de l'argent."""
        return self.paid - self.owed


def _totals_by_traveler(queryset) -> dict[int, Decimal]:
    return {
        row["traveler"]: row["total"]
        for row in queryset.values("traveler").annotate(total=Sum("amount"))
    }


def compute_balances(travel) -> list[TravelerBalance]:
    """Balance of every traveler of ``travel``: what they paid minus their shares.

    Covers ACCEPTED and LEFT participants (someone who left still owes, or is
    owed, for the spendings made before leaving), plus anyone who still has a
    spending or a share in the travel. Sorted by traveler id.
    """
    paid = _totals_by_traveler(Spending.objects.filter(travel=travel))
    owed = _totals_by_traveler(SpendingShare.objects.filter(spending__travel=travel))
    members = travel.participations.filter(
        status__in=[ParticipationStatus.ACCEPTED, ParticipationStatus.LEFT]
    ).values_list("traveler", flat=True)

    traveler_ids = set(members) | paid.keys() | owed.keys()
    travelers = get_user_model().objects.filter(pk__in=traveler_ids).order_by("pk")
    return [
        TravelerBalance(
            traveler=traveler,
            paid=paid.get(traveler.pk, Decimal(0)),
            owed=owed.get(traveler.pk, Decimal(0)),
        )
        for traveler in travelers
    ]


@dataclass(frozen=True)
class Settlement:
    debtor: object
    creditor: object
    amount: Decimal


def compute_settlements(travel) -> list[Settlement]:
    """Transfers that bring every balance of ``travel`` back to zero.

    Greedy: the biggest debtor repays the biggest creditor, as much as possible,
    until everyone is even. Gives at most ``n - 1`` transfers. Ties are broken
    by traveler id so the result is stable.
    """
    creditors: list[list] = []
    debtors: list[list] = []
    for balance in compute_balances(travel):
        if balance.balance > 0:
            creditors.append([balance.traveler, balance.balance])
        elif balance.balance < 0:
            debtors.append([balance.traveler, -balance.balance])

    def by_amount(entry: list) -> tuple:
        return (-entry[1], entry[0].pk)

    creditors.sort(key=by_amount)
    debtors.sort(key=by_amount)

    settlements = []
    while creditors and debtors:
        creditor, debtor = creditors[0], debtors[0]
        amount = min(creditor[1], debtor[1])
        settlements.append(
            Settlement(debtor=debtor[0], creditor=creditor[0], amount=amount)
        )
        creditor[1] -= amount
        debtor[1] -= amount
        if not creditor[1]:
            creditors.pop(0)
        if not debtor[1]:
            debtors.pop(0)
        # Le reste d'un solde partiellement rembourse peut ne plus etre le plus gros.
        creditors.sort(key=by_amount)
        debtors.sort(key=by_amount)
    return settlements
