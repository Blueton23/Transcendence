from django.core.management.base import BaseCommand

from traveler.presence import reset_presence


class Command(BaseCommand):
    help = (
        "Mark every traveler offline. Run at server startup, before any "
        "websocket connects: no socket survives a restart."
    )

    def handle(self, *args: object, **options: object) -> None:
        count = reset_presence()
        self.stdout.write(f"{count} traveler(s) marked offline.")
