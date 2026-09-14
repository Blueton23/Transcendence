from django.utils import timezone
from faker import Faker

from idea.models import Idea, IdeaStatus, IdeaType, Reaction


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
            arrival = (
                fake.date_between(start_date="today", end_date="+30d")
                if lodging
                else None
            )
            departure = (
                fake.date_between(start_date=arrival, end_date="+40d")
                if lodging
                else None
            )

            status = fake.random_element(elements=IdeaStatus.values)
            chosen = status == IdeaStatus.CHOSEN
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
                    status=status,
                    localisation=fake.city() if fake.boolean() else "",
                    note=fake.sentence() if fake.boolean() else None,
                    url=fake.url() if fake.boolean() else None,
                    latitude=round(fake.latitude(), 6),
                    longitude=round(fake.longitude(), 6),
                    price_per_night=fake.pydecimal(
                        left_digits=3, right_digits=2, positive=True
                    )
                    if lodging
                    else None,
                    arrival_date=arrival,
                    departure_date=departure,
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
