# Generated by Django 5.1 on 2025-02-18 16:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0025_investment_source_item_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='investment',
            name='source_item_id',
        ),
        migrations.AddField(
            model_name='investment',
            name='source_item',
            field=models.OneToOneField(blank=True, help_text='Powiązany rekord z modelu Item', null=True, on_delete=django.db.models.deletion.CASCADE, to='backend_api.item'),
        ),
        migrations.AlterField(
            model_name='investment',
            name='name',
            field=models.CharField(help_text='Nazwa inwestycji', max_length=100),
        ),
    ]
