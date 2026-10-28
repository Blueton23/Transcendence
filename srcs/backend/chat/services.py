from common.realtime import broadcast, travel_group

from .models import Message
from .serializers import MessageSerializer


def broadcast_message(message):
    payload = MessageSerializer(message).data
    # "is_unread" depends on who reads it: each client works it out.
    del payload["is_unread"]
    broadcast(travel_group(message.travel_id), "chat.message", payload)


def post_system_message(travel_id, body):
    """Adds an authorless message to the travel chat (someone joined, left...)
    and sends it to the open sockets like any other message."""
    message = Message.objects.create(travel_id=travel_id, is_system=True, body=body)
    broadcast_message(message)
    return message
