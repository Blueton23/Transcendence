from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Friendship, Traveler


class TravelerAdmin(UserAdmin):
    model = Traveler
    fieldsets = UserAdmin.fieldsets + (
        ("Traveler info", {"fields": ("profile_picture_url",)}),
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )


admin.site.register(Traveler, TravelerAdmin)


class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "status", "created_at")
    list_filter = ("status",)


admin.site.register(Friendship, FriendshipAdmin)
