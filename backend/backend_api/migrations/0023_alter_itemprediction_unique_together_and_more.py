# Generated by Django 5.1 on 2025-01-27 17:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0022_itemprediction'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='itemprediction',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='itemprediction',
            name='item_description',
            field=models.CharField(default='a', max_length=255, unique=True),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name='itemprediction',
            name='item',
        ),
        migrations.RemoveField(
            model_name='itemprediction',
            name='shop',
        ),
    ]
