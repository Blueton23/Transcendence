# config/websocket_urls.py
from django.urls import path

from config.consumers import PingConsumer
from travel.consumers import TravelConsumer
from traveler.consumers import NotificationConsumer

websocket_urlpatterns = [
    path("ws/ping/", PingConsumer.as_asgi()),
    path("ws/travels/<int:travel_id>/", TravelConsumer.as_asgi()),
    path("ws/notifications/", NotificationConsumer.as_asgi()),
]
