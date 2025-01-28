# Generated by Django 5.1 on 2025-01-25 11:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0018_remove_item_owner_item_owners'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='owners',
        ),
        migrations.AddField(
            model_name='item',
            name='owners',
            field=models.ManyToManyField(related_name='items', to='backend_api.person'),
        ),
    ]
