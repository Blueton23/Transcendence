from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Traveler

class TravelerAdmin(UserAdmin):
	model = Traveler
	fieldsets = UserAdmin.fieldsets + (
		("Traveler info", {"fields": ("profile_picture_url",)}),
	)
	readonly_fields = ("created_at", "updated_at")

admin.site.register(Traveler, TravelerAdmin)
