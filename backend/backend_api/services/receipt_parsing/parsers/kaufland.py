from .base import BaseReceiptParser


class KauflandReceiptParser(BaseReceiptParser):
    def matches(self, store_type: str, text: str) -> bool:
        return store_type == "kaufland"

    def parse(self, text: str) -> list[dict]:
        lines = self.normalize_lines(text)
        if not lines:
            return []

        items = []
        in_items_section = False

        for line in lines:
            normalized_line = line.lower()
            if "cena pln" in normalized_line:
                in_items_section = True
                continue
            if not in_items_section:
                continue
            if "ogółem" in normalized_line or "ogolem" in normalized_line:
                break
            if self.TAX_SUMMARY_LINE_RE.match(line):
                continue
            if self.is_summary_or_payment_line(line):
                continue
            if self.DATE_RE.search(line):
                continue

            price_match = self.PRICE_RE.search(line)
            if not price_match:
                continue

            description = line[: price_match.start()].strip(" -:;")
            description = " ".join(description.split())
            if not description or len(description) < 3:
                continue

            if any(phrase in normalized_line for phrase in [
                "podsumowanie zakupów", "numer klienta", "za ten zakup",
                "podatek", "brutto", "netto",
            ]):
                continue

            items.append({
                "description": description,
                "value": price_match.group(1).replace(",", "."),
                "quantity": 1,
                "category": "food_drinks",
                "owners": [1, 2],
            })

        return items
