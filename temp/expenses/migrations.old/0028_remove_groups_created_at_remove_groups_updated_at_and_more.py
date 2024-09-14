# Generated by Django 5.1 on 2024-09-13 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0027_alter_receipt_payer_alter_transaction_owners'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='groups',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='groups',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='user',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='user',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
        migrations.AlterField(
            model_name='transaction',
            name='quantity',
            field=models.DecimalField(blank=True, decimal_places=0, default=1, max_digits=10),
        ),
    ]
