# Generated by Django 5.1 on 2024-09-15 08:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0010_alter_item_owners'),
    ]

    operations = [
        migrations.RenameField(
            model_name='item',
            old_name='owners',
            new_name='owner',
        ),
    ]
