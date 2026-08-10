from django.contrib.auth.models import AbstractUser
from django.db import models


class Traveler(AbstractUser):
	email = models.EmailField("email address", unique=True)
	profile_picture_url = models.URLField(blank=True, null=True)
	is_online = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		swappable = "AUTH_USER_MODEL"
