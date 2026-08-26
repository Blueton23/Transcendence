from django.core.management.base import BaseCommand, CommandParser
from faker import Faker

from common.seeders.traveler import seed_friendships, seed_travelers


class Command(BaseCommand):
    help = "Fill the database with fake test data (travelers, friendships, ...)."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--travelers", type=int, default=20)
        parser.add_argument("--friendships", type=int, default=10)

    def handle(self, *args: object, **options: object) -> None:
        fake = Faker()

        travelers = seed_travelers(fake, options["travelers"])
        self.stdout.write(f"Created {len(travelers)} travelers.")

        friendships = seed_friendships(fake, travelers, options["friendships"])
        self.stdout.write(f"Created {len(friendships)} friendships.")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
