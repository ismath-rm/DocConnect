# Generated by Django 4.2.5 on 2024-06-27 10:52

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("account", "0002_user_consultation_type_user_department_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="consultation_type",
        ),
        migrations.RemoveField(
            model_name="user",
            name="department",
        ),
        migrations.RemoveField(
            model_name="user",
            name="description",
        ),
        migrations.RemoveField(
            model_name="user",
            name="education",
        ),
        migrations.RemoveField(
            model_name="user",
            name="experience",
        ),
        migrations.RemoveField(
            model_name="user",
            name="medical_license",
        ),
    ]
