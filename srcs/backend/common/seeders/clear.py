from django.contrib.auth import get_user_model

from travel.models import Participation, Step, Travel
from traveler.models import Friendship

Traveler = get_user_model()


def clear_seed_data(*, keep_superusers: bool = True) -> dict[str, int]:
    """Delete the data produced by the ``seed`` command.

    Rows are not tagged as "seeded", so this wipes the whole domain: every
    friendship, participation, step and travel, plus the travelers. Superusers
    are kept by default so the admin account survives.

    Returns a mapping of label -> number of rows deleted.
    """
    deleted = {
        "friendships": Friendship.objects.all().delete()[0],
        "participations": Participation.objects.all().delete()[0],
        "steps": Step.objects.all().delete()[0],
        "travels": Travel.objects.all().delete()[0],
    }

    travelers = Traveler.objects.all()
    if keep_superusers:
        travelers = travelers.filter(is_superuser=False)
    deleted["travelers"] = travelers.delete()[0]

    return deleted
