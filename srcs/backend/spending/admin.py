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
    # Les __str__ de step et idea affichent leur travel : on evite le N+1.
    list_select_related = ("travel", "traveler", "step__travel", "idea__travel")
    list_filter = ("category", "travel")
    search_fields = ("travel__title", "traveler__username")
    readonly_fields = ("created_at", "updated_at")


admin.site.register(Spending, SpendingAdmin)
