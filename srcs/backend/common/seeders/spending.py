from faker import Faker

from idea.models import IdeaType
from spending.models import Spending, SpendingCategory
from travel.models import Participation, ParticipationStatus

# Une depense liee a une idee prend la categorie qui lui correspond.
IDEA_TYPE_TO_CATEGORY = {
    IdeaType.RESTAURANT: SpendingCategory.MEALS,
    IdeaType.LODGING: SpendingCategory.LODGING,
    IdeaType.ACTIVITY: SpendingCategory.ACTIVITIES,
    IdeaType.SIGHT: SpendingCategory.ACTIVITIES,
}


def seed_spendings(
    fake: Faker, travelers: list, travels: list, per_travel: int
) -> list:
    spendings = []
    for travel in travels:
        # Le payeur doit etre un participant du voyage : si aucun n'a accepte,
        # on en fait accepter un pour pouvoir seeder des depenses.
        payers = [
            p.traveler
            for p in travel.participations.filter(
                status=ParticipationStatus.ACCEPTED
            ).select_related("traveler")
        ]
        if not payers:
            payer = fake.random_element(elements=travelers)
            Participation.objects.update_or_create(
                traveler=payer,
                travel=travel,
                defaults={"status": ParticipationStatus.ACCEPTED, "left_at": None},
            )
            payers = [payer]
        steps = list(travel.steps.all())
        ideas = list(travel.ideas.all())

        for _ in range(per_travel):
            step = None
            idea = None

            # ~1/3 liees a une idee, ~1/3 a une etape, le reste au voyage seul
            roll = fake.random_int(min=1, max=3)
            if roll == 1 and ideas:
                idea = fake.random_element(elements=ideas)
                step = idea.step
                category = IDEA_TYPE_TO_CATEGORY[idea.type]
            elif roll == 2 and steps:
                step = fake.random_element(elements=steps)
                category = fake.random_element(elements=SpendingCategory.values)
            else:
                category = fake.random_element(
                    elements=[
                        SpendingCategory.FUEL,
                        SpendingCategory.TOLLS,
                        SpendingCategory.OTHER,
                    ]
                )

            spendings.append(
                Spending.objects.create(
                    travel=travel,
                    traveler=fake.random_element(elements=payers),
                    step=step,
                    idea=idea,
                    category=category,
                    amount=fake.pydecimal(left_digits=3, right_digits=2, positive=True),
                    paid_date=fake.date_between_dates(
                        date_start=travel.start_date, date_end=travel.end_date
                    )
                    if fake.boolean(chance_of_getting_true=80)
                    else None,
                )
            )
    return spendings
