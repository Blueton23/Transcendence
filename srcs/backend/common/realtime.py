from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from djangorestframework_camel_case.util import camelize


def travel_group(travel_id) -> str:
    """Name of the channel layer group shared by every socket of a travel."""
    return f"travel_{travel_id}"


def broadcast(group: str, event_type: str, payload: dict) -> None:
    """Send `{"type": event_type, "payload": payload}` to a group once the
    current transaction commits.

    The payload is camelized here because consumers bypass the DRF renderer,
    so the frontend gets the same casing on the socket as on REST. Channels
    dispatches on "type", so `idea.created` calls `idea_created` on each
    consumer of the group.
    """
    message = {"type": event_type, "payload": camelize(payload)}

    def send():
        async_to_sync(get_channel_layer().group_send)(group, message)

    transaction.on_commit(send)
