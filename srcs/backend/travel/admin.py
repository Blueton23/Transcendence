from django.contrib import admin

from .models import Participation, Travel


class TravelAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "end_date", "status", "created_at")
    list_filter = ("status",)
    readonly_fields = ("invite_token", "created_at", "updated_at")


admin.site.register(Travel, TravelAdmin)


class ParticipationAdmin(admin.ModelAdmin):
    list_display = ("traveler", "travel", "status", "created_at")
    list_filter = ("status",)


admin.site.register(Participation, ParticipationAdmin)
