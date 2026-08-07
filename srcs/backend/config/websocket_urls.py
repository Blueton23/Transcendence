# config/websocket_urls.py
from django.urls import path
from config.consumers import PingConsumer

websocket_urlpatterns = [
    path("ws/ping/", PingConsumer.as_asgi()),
]