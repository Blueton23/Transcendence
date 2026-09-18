from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ValidatedModel(models.Model):
    """Runs full_clean() on every save so clean()/business-rule validation
    (cross-field, cross-model) is enforced consistently, not just from forms/admin."""

    class Meta:
        abstract = True

    def save(self, *args: object, **kwargs: object) -> None:
        self.full_clean()
        super().save(*args, **kwargs)
