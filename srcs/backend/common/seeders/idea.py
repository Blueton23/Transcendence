from django.utils import timezone
from faker import Faker

from idea.models import Idea, IdeaType, Reaction


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
            # Seul un hebergement place sur une etape peut etre chosen.
            chosen = (
                lodging and step is not None and fake.boolean(chance_of_getting_true=30)
            )

            if lodging:
                start = fake.date_between(start_date="today", end_date="+30d")
                end = fake.date_between(start_date=start, end_date="+40d")
            elif step is not None:
                start = end = fake.date_between(
                    start_date=step.start_date, end_date=step.end_date
                )
            else:
                start = end = None

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
