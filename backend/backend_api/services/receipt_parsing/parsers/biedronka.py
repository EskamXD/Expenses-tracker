import re

from .base import BaseReceiptParser


class BiedronkaReceiptParser(BaseReceiptParser):
    def matches(self, store_type: str, text: str) -> bool:
        return store_type == "biedronka"

    def parse(self, text: str) -> list[dict]:
        lines = self.normalize_lines(text)
        if not lines:
            return []

        items = []
        in_items_section = False
        awaiting_discounted_price = False
        pending_name_prefix = ""

        for line in lines:
            normalized_line = line.lower()

            if "nazwa" in normalized_line and "cena" in normalized_line:
                in_items_section = True
                continue

            if not in_items_section:
                continue

            if self.is_biedronka_summary_line(line):
                break
            if self.PAGE_FOOTER_RE.match(line):
                continue
            if normalized_line == "niefiskalny":
                continue
            if self.TAX_SUMMARY_LINE_RE.match(line):
                continue
            if self.is_summary_or_payment_line(line):
                continue
            if re.fullmatch(r"\d{4,}/\d+/\d+/\d{2}\.\d{2}\.\d{4}", line):
                continue

            if self.is_discount_line(line):
                awaiting_discounted_price = bool(items)
                continue

            if awaiting_discounted_price and items and self.is_final_price_line(line):
                items[-1]["value"] = line.replace(",", ".")
                awaiting_discounted_price = False
                continue

            parsed_product = self._parse_product_line(line)
            if parsed_product:
                description = parsed_product["description"]
                if pending_name_prefix:
                    description = self.merge_similar_name_lines(pending_name_prefix, description)
                    pending_name_prefix = ""

                items.append({
                    "description": description,
                    "value": parsed_product["value"],
                    "quantity": parsed_product["quantity"],
                    "category": "food_drinks",
                    "owners": [1, 2],
                })
                awaiting_discounted_price = False
                continue

            if self.looks_like_biedronka_name_continuation(line):
                if items and not awaiting_discounted_price:
                    pending_name_prefix = (
                        self.merge_similar_name_lines(pending_name_prefix, line)
                        if pending_name_prefix else line
                    )
                continue

            awaiting_discounted_price = False

        return items

    def _parse_product_line(self, line):
        match = self.BIEDRONKA_PRODUCT_LINE_RE.match(line)
        if not match:
            return None

        description = match.group("name").strip(" -:;")
        description = re.sub(r"\s{2,}", " ", description)
        if not description or len(description) < 2:
            return None

        quantity = self.normalize_quantity_token(match.group("qty"))
        total_value_raw = match.group("value") or match.group("unit")
        value = total_value_raw.replace(",", ".")

        return {"description": description, "quantity": quantity, "value": value}
