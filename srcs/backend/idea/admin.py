from django.contrib import admin

from .models import Idea, Reaction


class ReactionInline(admin.TabularInline):
    model = Reaction
    extra = 0
    fields = ("traveler", "created_at")
    readonly_fields = ("created_at",)


class IdeaAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "travel",
        "step",
        "type",
        "status",
        "traveler",
        "deleted_at",
    )
    list_filter = ("type", "status", "travel")
    search_fields = ("title", "localisation")
    readonly_fields = ("created_at", "updated_at")
    inlines = (ReactionInline,)


admin.site.register(Idea, IdeaAdmin)


class ReactionAdmin(admin.ModelAdmin):
    list_display = ("traveler", "idea", "created_at")
    search_fields = ("idea__title",)


admin.site.register(Reaction, ReactionAdmin)
