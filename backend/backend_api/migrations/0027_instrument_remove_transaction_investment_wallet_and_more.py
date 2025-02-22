# Generated by Django 5.1 on 2025-02-18 20:07

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0026_remove_investment_source_item_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Instrument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('symbol', models.CharField(max_length=20, unique=True)),
                ('category', models.CharField(choices=[('stock', 'Akcje'), ('etf', 'ETF'), ('bond', 'Obligacje'), ('crypto', 'Kryptowaluty'), ('commodity', 'Surowce'), ('other', 'Inne')], max_length=20)),
                ('market', models.CharField(blank=True, help_text='Nazwa giełdy lub rynku (np. GPW, NASDAQ)', max_length=50, null=True)),
                ('currency', models.CharField(default='PLN', max_length=10)),
                ('description', models.TextField(blank=True, null=True)),
                ('current_price', models.DecimalField(blank=True, decimal_places=2, max_digits=20, null=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='investment',
        ),
        migrations.CreateModel(
            name='Wallet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('total_value', models.DecimalField(decimal_places=2, default=0, max_digits=20)),
                ('total_invest_income', models.DecimalField(decimal_places=2, default=0, max_digits=20)),
                ('last_update', models.DateTimeField(auto_now=True)),
                ('parent_wallet', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sub_wallets', to='backend_api.wallet')),
            ],
        ),
        migrations.CreateModel(
            name='Invest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.DecimalField(decimal_places=2, max_digits=20)),
                ('current_value', models.DecimalField(decimal_places=2, default=0, max_digits=20)),
                ('payment_date', models.DateField()),
                ('transaction_type', models.CharField(choices=[('buy', 'Kupno'), ('sell', 'Sprzedaż'), ('dividend', 'Dywidenda')], max_length=20)),
                ('instrument', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='investments', to='backend_api.instrument')),
                ('wallet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='investments', to='backend_api.wallet')),
            ],
        ),
        migrations.CreateModel(
            name='WalletSnapshot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('snapshot_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('total_value', models.DecimalField(decimal_places=2, max_digits=20)),
                ('total_invest_income', models.DecimalField(decimal_places=2, max_digits=20)),
                ('wallet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='snapshots', to='backend_api.wallet')),
            ],
        ),
        migrations.DeleteModel(
            name='Investment',
        ),
        migrations.DeleteModel(
            name='Transaction',
        ),
    ]
