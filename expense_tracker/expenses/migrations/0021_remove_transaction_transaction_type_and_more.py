# Generated by Django 5.1 on 2024-09-04 12:05

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0020_receipt_shop'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='transaction_type',
        ),
        migrations.AddField(
            model_name='receipt',
            name='transaction_type',
            field=models.CharField(choices=[('expense', 'Wydatki'), ('income', 'Przychody')], default=django.utils.timezone.now, max_length=10),
            preserve_default=False,
        ),
    ]
