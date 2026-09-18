from faker import Faker

from travel.models import Participation, ParticipationStatus, Step, Travel


def seed_travels(fake: Faker, count: int) -> list:
    travels = []
    for _ in range(count):
        start_date = fake.date_between(start_date="-30d", end_date="+60d")
        end_date = fake.date_between(start_date=start_date, end_date="+90d")
        travels.append(
            Travel.objects.create(
                title=fake.catch_phrase()[:50],
                start_date=start_date,
                end_date=end_date,
            )
        )
    return travels


def seed_participations(
    fake: Faker, travelers: list, travels: list, count: int
) -> list:
    participations = []
    attempts = 0
    max_attempts = count * 10

    while len(participations) < count and attempts < max_attempts:
        attempts += 1
        traveler = fake.random_element(elements=travelers)
        travel = fake.random_element(elements=travels)

        if Participation.objects.filter(traveler=traveler, travel=travel).exists():
            continue

        participations.append(
            Participation.objects.create(
                traveler=traveler,
                travel=travel,
                status=fake.random_element(elements=ParticipationStatus.values),
            )
        )

    return participations


def seed_steps(fake: Faker, travels: list, per_travel: int) -> list:
    steps = []
    for travel in travels:
        # Chaque etape commence au plus tot la ou la precedente finit :
        # pas de chevauchement, mais des trous possibles entre les etapes.
        current = travel.start_date
        for _ in range(per_travel):
            start_date = fake.date_between_dates(
                date_start=current, date_end=travel.end_date
            )
            end_date = fake.date_between_dates(
                date_start=start_date, date_end=travel.end_date
            )
            steps.append(
                Step.objects.create(
                    travel=travel,
                    start_date=start_date,
                    end_date=end_date,
                    localisation=fake.city(),
                    latitude=round(fake.latitude(), 6),
                    longitude=round(fake.longitude(), 6),
                )
            )
            current = end_date
    return steps
