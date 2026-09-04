from django.contrib import admin

from .models import Participation, Step, Travel


class StepInline(admin.TabularInline):
    model = Step
    extra = 0
    fields = (
        "start_date",
        "end_date",
        "priority",
        "localisation",
        "latitude",
        "longitude",
        "deleted_at",
    )


class TravelAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "end_date", "status", "created_at")
    list_filter = ("status",)
    readonly_fields = ("invite_token", "created_at", "updated_at")
    inlines = (StepInline,)


admin.site.register(Travel, TravelAdmin)


class ParticipationAdmin(admin.ModelAdmin):
    list_display = ("traveler", "travel", "status", "created_at")
    list_filter = ("status",)


admin.site.register(Participation, ParticipationAdmin)


class StepAdmin(admin.ModelAdmin):
    list_display = (
        "travel",
        "localisation",
        "start_date",
        "end_date",
        "priority",
        "deleted_at",
    )
    list_filter = ("travel",)
    search_fields = ("localisation",)


admin.site.register(Step, StepAdmin)
