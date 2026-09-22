from django.contrib import admin

from .models import Spending


class SpendingAdmin(admin.ModelAdmin):
    list_display = (
        "category",
        "amount",
        "travel",
        "traveler",
        "step",
        "idea",
        "paid_date",
    )
    list_filter = ("category", "travel")
    search_fields = ("travel__title", "traveler__username")
    readonly_fields = ("created_at", "updated_at")


admin.site.register(Spending, SpendingAdmin)
