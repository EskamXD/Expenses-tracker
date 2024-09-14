# Generated by Django 5.1 on 2024-09-14 07:16

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses_api', '0003_personowner_rename_person_personpayer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='category',
            field=models.CharField(choices=[('fuel', 'Paliwo'), ('car_expenses', 'Wydatki na samochód'), ('fastfood', 'Fast Food'), ('alcohol', 'Alkohol'), ('food_drinks', 'Picie & jedzenie'), ('chemistry', 'Chemia'), ('clothes', 'Ubrania'), ('electronics_games', 'Elektornika & gry'), ('tickets_entrance', 'Bilety & wejściówki'), ('other_shopping', 'Inne zakupy'), ('flat_bills', 'Rachunki za mieszkanie'), ('monthly_subscriptions', 'Miesięczne subskrypcje'), ('other_cyclical_expenses', 'Inne cykliczne wydatki'), ('investments_savings', 'Inwestycje & oszczędności'), ('other', 'Inne'), ('for_study', 'Na studia'), ('work_income', 'Przychód z pracy'), ('family_income', 'Przychód od rodziny'), ('investments_income', 'Przychód z inwestycji'), ('money_back', 'Zwrot pieniędzy')], default='other_shopping', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='quantity',
            field=models.DecimalField(decimal_places=0, default=1, max_digits=10),
        ),
        migrations.AddField(
            model_name='item',
            name='save_date',
            field=models.DateField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='receipt',
            name='shop',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='receipt',
            name='transaction_type',
            field=models.CharField(choices=[('expense', 'Expense'), ('income', 'Income')], default='expense', max_length=255),
            preserve_default=False,
        ),
    ]
