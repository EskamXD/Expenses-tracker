import re

from .base import BaseReceiptParser


class GenericReceiptParser(BaseReceiptParser):
    def matches(self, store_type: str, text: str) -> bool:
        return True

    def parse(self, text: str) -> list[dict]:
        items = []
        lines = self.normalize_lines(text)

        for line in lines:
            normalized_line = line.lower()

            if self.IGNORE_LINE_RE.match(line):
                continue
            if self.TAX_SUMMARY_LINE_RE.match(line):
                continue
            if re.search(r"\b(brutto|netto|podatek)\b", normalized_line):
                continue
            if "podatek% brutto netto" in normalized_line:
                continue
            if self.is_summary_or_payment_line(line):
                continue
            if any(phrase in normalized_line for phrase in [
                "paragon fiskalny", "nip", "kasa", "kasjer", "terminal",
                "gotowka", "gotówka", "karta", "ptu",
                "sprzedaz opod", "sprzedaż opod", "change",
            ]):
                continue

            price_match = self.PRICE_RE.search(line)
            if not price_match:
                continue

            price_raw = price_match.group(1).replace(",", ".")
            description = line[: price_match.start()].strip(" -:;")
            quantity = 1

            inline_qty_match = self.GENERIC_QTY_INLINE_RE.search(description)
            if inline_qty_match:
                quantity = self.normalize_quantity_token(inline_qty_match.group("qty"))
                description = description[: inline_qty_match.start()].strip(" -:;")

            description = re.sub(r"\b[A-Za-z]{1,2}\b$", "", description).strip()
            description = re.sub(r"\s{2,}", " ", description)

            if not description or len(description) < 2:
                continue
            if self.IGNORE_LINE_RE.match(description):
                continue
            if any(char.isdigit() for char in description[:2]) and len(description) < 8:
                continue

            items.append({
                "description": description,
                "value": price_raw,
                "quantity": quantity,
                "category": "food_drinks",
                "owners": [1, 2],
            })

        return items
