from django.contrib import admin

from .models import Spending, SpendingShare


class SpendingShareInline(admin.TabularInline):
    model = SpendingShare
    extra = 0
    fields = ("traveler", "amount")


class SpendingAdmin(admin.ModelAdmin):
    inlines = (SpendingShareInline,)
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


class SpendingShareAdmin(admin.ModelAdmin):
    list_display = ("traveler", "amount", "spending", "travel")
    # Le __str__ de spending affiche son travel : on evite le N+1.
    list_select_related = ("traveler", "spending__travel")
    list_filter = ("spending__travel",)
    search_fields = ("traveler__username", "spending__travel__title")
    autocomplete_fields = ("spending",)
    readonly_fields = ("created_at", "updated_at")

    @admin.display(ordering="spending__travel")
    def travel(self, obj: SpendingShare) -> str:
        return str(obj.spending.travel)


admin.site.register(SpendingShare, SpendingShareAdmin)
