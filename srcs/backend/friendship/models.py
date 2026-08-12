from django.db import models
from django.conf import settings
from django.db.models import CheckConstraint, F, Q, UniqueConstraint

class Status(models.TextChoices):
	PENDING = "p", "Pending"
	ACCEPTED = "a", "Accepted"

class Friendship(models.Model):
	sender = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="friendships_as_sender",
	)
	receiver = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="friendships_as_receiver",
	)
	requested_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="friendships_requested",
	)
	status = models.CharField(max_length=1, choices=Status.choices, default=Status.PENDING)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			UniqueConstraint(
				fields=["sender", "receiver"],
				name="unique_friendship"
			),
			CheckConstraint(
				check=Q(sender__lt=F("receiver")),
				name="friendship_sender_lt_receiver"
			),
		]
