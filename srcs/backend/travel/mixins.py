from .models import ParticipationStatus


class ParticipantScopedMixin:
    participation_path = "participations"

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(
                **{
                    f"{self.participation_path}__traveler": self.request.user,
                    f"{self.participation_path}__status": ParticipationStatus.ACCEPTED,
                }
            )
        )
