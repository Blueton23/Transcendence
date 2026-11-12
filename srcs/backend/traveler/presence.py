from django.db import transaction
from django.db.models import Q

from common.realtime import broadcast, user_group

from .models import Friendship, Status, Traveler


def friend_ids(traveler_id) -> list[int]:
    """Ids of the accepted friends of a traveler."""
    friendships = Friendship.objects.filter(
        Q(user1_id=traveler_id) | Q(user2_id=traveler_id),
        status=Status.ACCEPTED,
    ).values_list("user1_id", "user2_id")

    return [
        user2_id if user1_id == traveler_id else user1_id
        for user1_id, user2_id in friendships
    ]


def notify_presence(traveler_id, is_online) -> None:
    payload = {"traveler_id": traveler_id, "is_online": is_online}
    for friend_id in friend_ids(traveler_id):
        broadcast(user_group(friend_id), "presence.changed", payload)


def _update_connections(traveler_id, delta) -> None:
    # The row lock serializes the tabs of one traveler, so two sockets opening
    # (or closing) at once cannot both miss, or both see, the 0 <-> 1 switch.
    with transaction.atomic():
        traveler = (
            Traveler.objects.select_for_update()
            .only("online_connections", "is_online")
            .filter(pk=traveler_id)
            .first()
        )
        if traveler is None:
            return

        connections = max(traveler.online_connections + delta, 0)
        is_online = connections > 0
        changed = is_online != traveler.is_online

        traveler.online_connections = connections
        traveler.is_online = is_online
        traveler.save(update_fields=["online_connections", "is_online"])

        if changed:
            notify_presence(traveler_id, is_online)


def traveler_connected(traveler_id) -> None:
    _update_connections(traveler_id, 1)


def traveler_disconnected(traveler_id) -> None:
    _update_connections(traveler_id, -1)


def reset_presence() -> int:
    return Traveler.objects.filter(
        Q(is_online=True) | Q(online_connections__gt=0)
    ).update(is_online=False, online_connections=0)
