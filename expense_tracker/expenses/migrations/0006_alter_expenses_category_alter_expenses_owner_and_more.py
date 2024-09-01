# Generated by Django 5.1 on 2024-09-01 15:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0005_expenses_receipt_delete_expense_expenses_receipt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expenses',
            name='category',
            field=models.CharField(choices=[('fuel', 'Paliwo'), ('car_expenses', 'Wydatki Samochód'), ('fastfood', 'Fastfood'), ('alcohol', 'Alkohol'), ('food_drinks', 'Picie & Jedzenie'), ('chemistry', 'Chemia'), ('clothes', 'Ubrania'), ('electronics_games', 'Elektronika & Gry'), ('tickets_entrance', 'Bilety & Wejściówki'), ('other_shopping', 'Inne Zakupy'), ('flat_bills', 'Mieszkanie'), ('monthly_subscriptions', 'Miesięczne Subskrypcje'), ('other_cyclical_expenses', 'Inne Cykliczne Wydatki'), ('investments_savings', 'Inwestycje, Lokaty & Oszczędności'), ('other', 'Inne')], max_length=50),
        ),
        migrations.AlterField(
            model_name='expenses',
            name='owner',
            field=models.CharField(choices=[('kamil', 'Kamil'), ('ania', 'Ania'), ('common', 'Wspólne')], max_length=50),
        ),
        migrations.AlterField(
            model_name='expenses',
            name='payer',
            field=models.CharField(choices=[('kamil', 'Kamil'), ('ania', 'Ania')], max_length=50),
        ),
        migrations.AlterField(
            model_name='summary',
            name='owner',
            field=models.CharField(choices=[('kamil', 'Kamil'), ('ania', 'Ania'), ('common', 'Wspólne')], max_length=50),
        ),
    ]
