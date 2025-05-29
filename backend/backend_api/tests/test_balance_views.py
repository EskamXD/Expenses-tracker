# tests/test_balance_and_ratio.py

from datetime import date
from decimal import Decimal
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from backend_api.models import Person, Receipt, Item


class BalanceAndRatioTests(APITestCase):
    def setUp(self):
        # Wszystkie osoby są ownerami; tylko "payer" ma flagę payer=True
        self.payer = Person.objects.create(name="Payer", payer=True, owner=True)
        self.alice = Person.objects.create(name="Alice", payer=False, owner=True)
        self.bob = Person.objects.create(name="Bob", payer=False, owner=True)

        # Bazowe daty
        self.year = 2025
        self.month = 5

    def _create_receipt(self, trans_type, shop, payment_date, items_data):
        """
        Pomocnik: tworzy paragon z podanymi pozycjami.
        items_data = [
            {"category": "...", "value": 100, "owners": [self.alice, self.bob]},
            ...
        ]
        """
        r = Receipt.objects.create(
            payer=self.payer,
            shop=shop,
            transaction_type=trans_type,
            payment_date=payment_date,
        )
        for d in items_data:
            item = Item.objects.create(
                category=d["category"],
                value=Decimal(d["value"]),
                description="test",
                quantity=1,
            )
            item.owners.set(d["owners"])
            r.items.add(item)
        return r

    # --- TESTY DLA BalanceView GET ---

    def test_balance_get_no_params(self):
        url = reverse("balance")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", resp.data)

    def test_balance_get_computed_only(self):
        # Alice otrzyma income 200 (jedna pozycja), expense 50
        self._create_receipt(
            "income",
            "Inc",
            date(2025, 5, 10),
            [{"category": "work_income", "value": 200, "owners": [self.alice]}],
        )
        self._create_receipt(
            "expense",
            "Exp",
            date(2025, 5, 11),
            [{"category": "food_drinks", "value": 50, "owners": [self.alice]}],
        )

        url = reverse("balance")
        resp = self.client.get(
            url, {"owners[]": [self.alice.id], "year": self.year, "month": self.month}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # brak zapisanego last_month_balance, create=True
        self.assertTrue(resp.data["create"])
        # computed_balance = 200 - 50 = 150
        self.assertEqual(Decimal(resp.data["computed_balance"]), Decimal("150.00"))

    def test_balance_get_with_saved(self):
        # Po zapisaniu salda POST, GET nadal zwraca create=True i computed_balance (brak wpływu na computed)
        url = reverse("balance")
        post_data = {"year": self.year, "month": self.month, "value": "42.42"}
        resp_post = self.client.post(url, post_data, format="json")
        self.assertEqual(resp_post.status_code, status.HTTP_201_CREATED)

        # GET na payerze
        resp_get = self.client.get(
            url, {"owners[]": [self.payer.id], "year": self.year, "month": self.month}
        )
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)
        # nadal create=True (GET nie uwzględnia zapisanego last_month_balance)
        self.assertTrue(resp_get.data["create"])
        # computed_balance dla braku transakcji = 0
        self.assertEqual(Decimal(resp_get.data["computed_balance"]), Decimal("0.00"))

    # --- TESTY DLA BalanceView POST i PATCH ---

    def test_balance_post_missing_fields(self):
        url = reverse("balance")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_balance_post_and_patch(self):
        url = reverse("balance")
        # poprawny POST
        data = {"year": self.year, "month": self.month, "value": "100.00"}
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        created_item = Item.objects.get(category="last_month_balance")
        self.assertEqual(created_item.value, Decimal("100.00"))

        # PATCH: aktualizacja wartości poprzez URL ze ścieżką
        patch_url = reverse("balance-patch", args=[created_item.id])
        resp_patch = self.client.patch(patch_url, {"value": "123.45"}, format="json")
        self.assertEqual(resp_patch.status_code, status.HTTP_200_OK)
        created_item.refresh_from_db()
        self.assertEqual(created_item.value, Decimal("123.45"))

    # --- TESTY DLA SpendingRatioView GET ---

    def test_ratio_get_invalid(self):
        url = reverse("spending-ratio")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", resp.data)

    def test_ratio_get_no_expenses(self):
        url = reverse("spending-ratio")
        resp = self.client.get(
            url, {"owners[]": [self.alice.id], "year": self.year, "month": self.month}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data["available"])

    def test_ratio_get_basic_split(self):
        # 2 wydatki: 30 fuel, 20 fastfood, właścicielem Alice
        self._create_receipt(
            "expense",
            "S1",
            date(2025, 5, 5),
            [{"category": "fuel", "value": 30, "owners": [self.alice]}],
        )
        self._create_receipt(
            "expense",
            "S2",
            date(2025, 5, 6),
            [{"category": "fastfood", "value": 20, "owners": [self.alice]}],
        )

        url = reverse("spending-ratio")
        resp = self.client.get(
            url, {"owners[]": [self.alice.id], "year": self.year, "month": self.month}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # total = 50; invest=0%, spending (fuel)=30/50=60%, fun=20/50=40%
        self.assertAlmostEqual(resp.data["spending"], 60.0, places=2)
        self.assertAlmostEqual(resp.data["fun"], 40.0, places=2)
        self.assertEqual(resp.data["invest"], 0.0)
        # sprawdzamy, że zwracane są też listy ID pozycji
        self.assertEqual(
            set(resp.data["spending_ids"]),
            set(Item.objects.filter(category="fuel").values_list("id", flat=True)),
        )
