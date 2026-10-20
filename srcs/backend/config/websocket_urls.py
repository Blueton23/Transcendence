# config/websocket_urls.py
from django.urls import path

from config.consumers import PingConsumer
from travel.consumers import TravelConsumer

websocket_urlpatterns = [
    path("ws/ping/", PingConsumer.as_asgi()),
    path("ws/travels/<int:travel_id>/", TravelConsumer.as_asgi()),
]
