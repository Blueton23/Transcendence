from django.contrib import admin

from .models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "travel",
        "traveler",
        "is_system",
        "preview",
        "step",
        "idea",
        "created_at",
    )
    list_select_related = ("travel", "traveler", "step__travel", "idea__travel")
    list_filter = ("is_system", "travel")
    search_fields = ("body", "travel__title", "traveler__username")
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="body")
    def preview(self, obj: Message) -> str:
        return obj.body[:50]


admin.site.register(Message, MessageAdmin)
