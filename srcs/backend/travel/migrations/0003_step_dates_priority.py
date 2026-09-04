# Generated for the Step rework: priority instead of position, date range,
# drop of the nights field.

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("travel", "0002_step"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="step",
            name="unique_step_position_per_travel",
        ),
        migrations.RemoveField(
            model_name="step",
            name="position",
        ),
        migrations.RemoveField(
            model_name="step",
            name="nights",
        ),
        migrations.AddField(
            model_name="step",
            name="priority",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="step",
            name="start_date",
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="step",
            name="end_date",
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name="step",
            options={"ordering": ["start_date", "end_date", "priority"]},
        ),
        migrations.AddConstraint(
            model_name="step",
            constraint=models.CheckConstraint(
                check=models.Q(("end_date__gte", models.F("start_date"))),
                name="step_end_date_gte_start_date",
            ),
        ),
        migrations.AddConstraint(
            model_name="step",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    ("deleted_at__isnull", True), ("priority__isnull", False)
                ),
                fields=("travel", "start_date", "end_date", "priority"),
                name="unique_step_priority_per_travel_dates",
            ),
        ),
    ]
