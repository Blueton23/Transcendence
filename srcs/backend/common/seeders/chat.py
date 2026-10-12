from faker import Faker

from chat.models import Message
from travel.models import ParticipationStatus


def seed_messages(fake: Faker, travels: list, per_travel: int) -> list:
    messages = []
    for travel in travels:
        # Seuls les membres (accepted ou left) peuvent avoir ecrit dans le voyage.
        authors = [
            participation.traveler
            for participation in travel.participations.filter(
                status__in=[ParticipationStatus.ACCEPTED, ParticipationStatus.LEFT]
            ).select_related("traveler")
        ]
        steps = list(travel.steps.all())
        ideas = list(travel.ideas.all())

        for _ in range(per_travel):
            # ~1 message sur 10 est une notification systeme, sans auteur ;
            # un voyage sans membre n'a que des messages systeme.
            is_system = not authors or fake.boolean(chance_of_getting_true=10)

            # ~1 message sur 3 commente une etape ou une idee, jamais les deux.
            step = idea = None
            if fake.boolean(chance_of_getting_true=33):
                if steps and (not ideas or fake.boolean()):
                    step = fake.random_element(elements=steps)
                elif ideas:
                    idea = fake.random_element(elements=ideas)

            messages.append(
                Message.objects.create(
                    travel=travel,
                    traveler=None if is_system else fake.random_element(authors),
                    step=step,
                    idea=idea,
                    is_system=is_system,
                    body=fake.sentence(),
                )
            )
    return messages
