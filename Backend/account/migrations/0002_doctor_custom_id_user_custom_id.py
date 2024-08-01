# Generated by Django 5.0.6 on 2024-07-15 14:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("account", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="doctor",
            name="custom_id",
            field=models.CharField(
                blank=True, editable=False, max_length=10, null=True, unique=True
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="custom_id",
            field=models.CharField(
                blank=True, editable=False, max_length=10, null=True, unique=True
            ),
        ),
    ]
