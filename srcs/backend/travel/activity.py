from common.realtime import broadcast, user_group

from .models import Participation, ParticipationStatus


def notify_travel_activity(travel_id, author_id) -> None:
    """Sends `travel.activity` on the personal socket of every other member,
    so pages outside the travel (the "while you were away" card) can reload
    their unread counts. Travel sockets only reach those inside the travel."""
    member_ids = (
        Participation.objects.filter(
            travel_id=travel_id, status=ParticipationStatus.ACCEPTED
        )
        .exclude(traveler_id=author_id)
        .values_list("traveler_id", flat=True)
    )
    for member_id in member_ids:
        broadcast(user_group(member_id), "travel.activity", {"travel_id": travel_id})
