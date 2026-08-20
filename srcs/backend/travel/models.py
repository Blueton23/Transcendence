from django.db import models

# int id PK
# string Title
# date StartDate "date de départ"
# date EndDate "date de fin - borne ferme"
# string InviteToken UK "lien de partage pour rejoindre"
# enum Status "ouvert / terminé"
# datetime CreatedAt
# datetime UpdatedAt

class Status(models.TextChoices):
    CURRENT = "c", "Current"
    FINISHED = "f", "Finished"

class Travel (models.Model):
    title = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    invite_token = models.CharField(max_length=50) # a modif
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.CURRENT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
