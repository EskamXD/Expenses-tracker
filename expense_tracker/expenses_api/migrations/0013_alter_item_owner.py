# Generated by Django 5.1 on 2024-09-16 09:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses_api', '0012_alter_receipt_shop'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='owner',
            field=models.DecimalField(decimal_places=0, max_digits=10),
        ),
    ]
