from django.contrib.auth import get_user_model
from faker import Faker

from traveler.models import Friendship, Status

Traveler = get_user_model()


def seed_travelers(fake: Faker, count: int) -> list:
    return [
        Traveler.objects.create_user(
            username=fake.unique.user_name(),
            email=fake.unique.email(),
            password="password123",
            first_name=fake.first_name(),
            last_name=fake.last_name(),
        )
        for _ in range(count)
    ]


def seed_friendships(fake: Faker, travelers: list, count: int) -> list:
    friendships = []
    attempts = 0
    max_attempts = count * 10

    while len(friendships) < count and attempts < max_attempts:
        attempts += 1
        user1, user2 = fake.random_elements(travelers, length=2, unique=True)
        if user1.pk > user2.pk:
            user1, user2 = user2, user1

        if Friendship.objects.filter(user1=user1, user2=user2).exists():
            continue

        friendships.append(
            Friendship.objects.create(
                user1=user1,
                user2=user2,
                requested_by=fake.random_element(elements=(user1, user2)),
                status=fake.random_element(elements=Status.values),
            )
        )

    return friendships
