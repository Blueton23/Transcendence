from django.core.management.base import BaseCommand, CommandParser
from faker import Faker

from common.seeders.travel import seed_participations, seed_steps, seed_travels
from common.seeders.traveler import seed_friendships, seed_travelers


class Command(BaseCommand):
    help = (
        "Fill the database with fake test data (travelers, friendships, travels, ...)."
    )

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--travelers", type=int, default=20)
        parser.add_argument("--friendships", type=int, default=10)
        parser.add_argument("--travels", type=int, default=10)
        parser.add_argument("--participations", type=int, default=30)
        parser.add_argument("--steps-per-travel", type=int, default=4)

    def handle(self, *args: object, **options: object) -> None:
        fake = Faker()

        travelers = seed_travelers(fake, options["travelers"])
        self.stdout.write(f"Created {len(travelers)} travelers.")

        friendships = seed_friendships(fake, travelers, options["friendships"])
        self.stdout.write(f"Created {len(friendships)} friendships.")

        travels = seed_travels(fake, options["travels"])
        self.stdout.write(f"Created {len(travels)} travels.")

        participations = seed_participations(
            fake, travelers, travels, options["participations"]
        )
        self.stdout.write(f"Created {len(participations)} participations.")

        steps = seed_steps(fake, travels, options["steps_per_travel"])
        self.stdout.write(f"Created {len(steps)} steps.")

        self.stdout.write(self.style.SUCCESS("Seed complete."))
