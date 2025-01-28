# Generated by Django 5.1 on 2025-01-27 11:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0021_recentshop_alter_receipt_shop'),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemPrediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('frequency', models.PositiveIntegerField(default=0)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='backend_api.item')),
                ('shop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_predictions', to='backend_api.recentshop')),
            ],
            options={
                'unique_together': {('item', 'shop')},
            },
        ),
    ]
