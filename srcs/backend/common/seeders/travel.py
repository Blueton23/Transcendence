from collections import Counter, defaultdict

from faker import Faker

from travel.models import Participation, ParticipationStatus, Step, Travel


def seed_travels(fake: Faker, count: int) -> list:
    travels = []
    for _ in range(count):
        start_date = fake.date_between(start_date="-30d", end_date="+60d")
        end_date = fake.date_between(start_date=start_date, end_date="+90d")
        travels.append(
            Travel.objects.create(
                title=fake.catch_phrase(),
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
        date_ranges = []
        for _ in range(per_travel):
            start_date = fake.date_between_dates(
                date_start=travel.start_date, date_end=travel.end_date
            )
            end_date = fake.date_between_dates(
                date_start=start_date, date_end=travel.end_date
            )
            date_ranges.append((start_date, end_date))

        # priority ne sert qu'a departager des etapes qui partagent la meme plage
        range_counts = Counter(date_ranges)
        assigned = defaultdict(int)
        for start_date, end_date in date_ranges:
            key = (start_date, end_date)
            priority = None
            if range_counts[key] > 1:
                assigned[key] += 1
                priority = assigned[key]
            steps.append(
                Step.objects.create(
                    travel=travel,
                    priority=priority,
                    start_date=start_date,
                    end_date=end_date,
                    localisation=fake.city(),
                    latitude=round(fake.latitude(), 6),
                    longitude=round(fake.longitude(), 6),
                )
            )
    return steps
