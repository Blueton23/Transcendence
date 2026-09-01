from django.core.management.base import BaseCommand, CommandError, CommandParser

from common.seeders.clear import clear_seed_data


class Command(BaseCommand):
    help = (
        "Remove the fake data created by the seed command (travelers, "
        "friendships, travels, ...). Superusers are kept by default."
    )

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Skip the confirmation prompt.",
        )
        parser.add_argument(
            "--all-travelers",
            action="store_true",
            help="Also delete superusers (kept by default).",
        )

    def handle(self, *args: object, **options: object) -> None:
        if not options["yes"]:
            answer = input(
                "This deletes every travel, step, participation, friendship and "
                "traveler. Continue? [y/N] "
            )
            if answer.strip().lower() != "y":
                raise CommandError("Aborted.")

        deleted = clear_seed_data(keep_superusers=not options["all_travelers"])

        for label, count in deleted.items():
            self.stdout.write(f"Deleted {count} {label}.")

        self.stdout.write(self.style.SUCCESS("Unseed complete."))
