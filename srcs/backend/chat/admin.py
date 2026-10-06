from django.contrib import admin

from .models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "travel",
        "traveler",
        "is_system",
        "step",
        "idea",
        "created_at",
        "deleted_at",
    )
    list_filter = ("is_system", "travel")
    search_fields = ("body",)
    readonly_fields = ("created_at", "updated_at")


admin.site.register(Message, MessageAdmin)
