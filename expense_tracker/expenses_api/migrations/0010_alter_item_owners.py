# Generated by Django 5.1 on 2024-09-15 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses_api', '0009_person_owner_person_payer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='owners',
            field=models.DecimalField(decimal_places=0, default=1, max_digits=10),
        ),
    ]
