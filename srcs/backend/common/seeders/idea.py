from datetime import timedelta

from django.utils import timezone
from faker import Faker

from idea.models import Idea, IdeaType, Reaction


def _lodging_dates(fake: Faker, first_day, last_day):
    """Arrivée et départ d'un hébergement : au moins une nuit, ou None si c'est impossible."""
    if (last_day - first_day).days < 1:
        return None
    start = fake.date_between(
        start_date=first_day, end_date=last_day - timedelta(days=1)
    )
    end = fake.date_between(start_date=start + timedelta(days=1), end_date=last_day)
    return start, end


def seed_ideas(fake: Faker, travelers: list, travels: list, per_travel: int) -> list:
    tz = timezone.get_current_timezone()
    ideas = []
    for travel in travels:
        steps = list(travel.steps.all())
        for _ in range(per_travel):
            idea_type = fake.random_element(elements=IdeaType.values)

            # ~2 idees sur 3 sont rattachees a une etape, le reste au pool
            step = None
            if steps and fake.boolean(chance_of_getting_true=66):
                step = fake.random_element(elements=steps)

            lodging = idea_type == IdeaType.LODGING
            lodging_dates = None
            if lodging:
                first, last = (
                    (step.start_date, step.end_date)
                    if step is not None
                    else (travel.start_date, travel.end_date)
                )
                lodging_dates = _lodging_dates(fake, first, last)
                if lodging_dates is None:
                    # aucune nuit possible (étape ou voyage d'un seul jour)
                    idea_type = IdeaType.RESTAURANT
                    lodging = False

            if lodging:
                start, end = lodging_dates
            elif step is not None:
                start = end = fake.date_between(
                    start_date=step.start_date,
                    end_date=step.end_date,
                )
            else:
                start = end = None

            chosen = False

            if lodging and step is not None and fake.boolean(chance_of_getting_true=30):
                overlaps = Idea.objects.filter(
                    step=step,
                    type=IdeaType.LODGING,
                    chosen_at__isnull=False,
                    start_date__lte=end,
                    end_date__gte=start,
                ).exists()

                chosen = not overlaps

            ideas.append(
                Idea.objects.create(
                    travel=travel,
                    traveler=fake.random_element(elements=travelers),
                    step=step,
                    chosen_by=fake.random_element(elements=travelers)
                    if chosen
                    else None,
                    chosen_at=fake.past_datetime(tzinfo=tz) if chosen else None,
                    title=fake.catch_phrase(),
                    type=idea_type,
                    localisation=fake.city() if fake.boolean() else "",
                    note=fake.sentence() if fake.boolean() else "",
                    url=fake.url() if fake.boolean() else "",
                    latitude=round(fake.latitude(), 6),
                    longitude=round(fake.longitude(), 6),
                    price_per_night=fake.pydecimal(
                        left_digits=3, right_digits=2, positive=True
                    )
                    if lodging
                    else None,
                    start_date=start,
                    end_date=end,
                )
            )
    return ideas


def seed_reactions(fake: Faker, travelers: list, ideas: list, count: int) -> list:
    reactions = []
    attempts = 0
    max_attempts = count * 10

    while len(reactions) < count and attempts < max_attempts:
        attempts += 1
        traveler = fake.random_element(elements=travelers)
        idea = fake.random_element(elements=ideas)

        if Reaction.objects.filter(traveler=traveler, idea=idea).exists():
            continue

        reactions.append(Reaction.objects.create(traveler=traveler, idea=idea))

    return reactions
