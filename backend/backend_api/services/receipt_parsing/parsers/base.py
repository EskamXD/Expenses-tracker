import re
from abc import ABC, abstractmethod


class BaseReceiptParser(ABC):
    PRICE_RE = re.compile(r"(\d+[,.]\d{2})\s*(?:PLN|ZL|zł)?$", re.IGNORECASE)
    PRICE_ONLY_RE = re.compile(r"^\d+[,.]\d{2}$")
    DATE_RE = re.compile(r"\b(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})\b")
    TAX_SUMMARY_LINE_RE = re.compile(r"^[A-Z]\s+\d{1,2}%\s+(?:\d+[,.]\d{2}\s+){1,3}\d+[,.]\d{2}$")
    PAGE_FOOTER_RE = re.compile(r"^Strona\s+\d+\s+z\s+\d+$", re.IGNORECASE)
    NEGATIVE_PRICE_RE = re.compile(r"-\d+[,.]\d{2}")
    GENERIC_QTY_INLINE_RE = re.compile(r"\s+(?P<ptu>[A-Za-z]{1,2})\s+(?P<qty>\d+[,.]\d{3})\s*[x×*]\s+(?P<unit>\d+[,.]\d{2})$")
    BIEDRONKA_PRODUCT_LINE_RE = re.compile(
        r"^(?P<name>.+?)\s+(?P<ptu>[A-Za-z]{1,2})\s+(?P<qty>\d+[,.]\d{3})\s*[x×*]\s*"
        r"(?P<unit>\d+[,.]\d{2})(?:\s+(?P<value>\d+[,.]\d{2}))?$"
    )
    IGNORE_LINE_RE = re.compile(
        r"^(og[oó]łem|razem|suma|suma pln|sprzeda[żz]|podatek|vat|rabat|saldo|reszta|"
        r"podsumowanie zakup[oó]w|numer klienta|godzina|data:?)$",
        re.IGNORECASE,
    )

    @abstractmethod
    def matches(self, store_type: str, text: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def parse(self, text: str) -> list[dict]:
        raise NotImplementedError

    @staticmethod
    def normalize_lines(text):
        return [re.sub(r"\s+", " ", line).strip() for line in text.splitlines() if line and line.strip()]

    @staticmethod
    def normalize_quantity_token(quantity_token):
        if not quantity_token:
            return 1
        if quantity_token.endswith(".000") or quantity_token.endswith(",000"):
            try:
                return int(float(quantity_token.replace(",", ".")))
            except ValueError:
                return 1
        return 1

    @staticmethod
    def is_summary_or_payment_line(line):
        normalized_line = line.lower()
        return any(
            phrase in normalized_line
            for phrase in [
                "ogółem", "ogolem", "suma pln", "sprzedaż opodatkowana",
                "sprzedaz opodatkowana", "suma ptu", "karta płatnicza",
                "numer transakcji", "numer klienta", "za ten zakup otrzymałeś",
                "podsumowanie zakupów:", "podatek %", "brutto", "netto",
            ]
        )

    @staticmethod
    def is_biedronka_summary_line(line):
        normalized_line = line.lower()
        return any(
            normalized_line.startswith(prefix)
            for prefix in [
                "sprzedaż opodatkowana", "sprzedaz opodatkowana", "ptu ",
                "suma ptu", "suma pln", "kasa ", "kasjer",
                "karta płatnicza", "numer transakcji",
            ]
        )

    @staticmethod
    def is_discount_line(line):
        return line.lower().startswith("rabat") and bool(BaseReceiptParser.NEGATIVE_PRICE_RE.search(line))

    @staticmethod
    def is_final_price_line(line):
        return BaseReceiptParser.PRICE_ONLY_RE.match(line) is not None

    @staticmethod
    def looks_like_biedronka_name_continuation(line):
        if BaseReceiptParser.PRICE_ONLY_RE.match(line):
            return False
        if BaseReceiptParser.NEGATIVE_PRICE_RE.search(line):
            return False
        if BaseReceiptParser.TAX_SUMMARY_LINE_RE.match(line):
            return False
        lowered = line.lower()
        if lowered.startswith("rabat"):
            return False
        if any(phrase in lowered for phrase in [
            "sprzedaż opodatkowana", "sprzedaz opodatkowana", "suma ptu",
            "suma pln", "karta płatnicza", "numer transakcji", "kasjer", "kasa ",
        ]):
            return False
        if len(line) < 3:
            return False
        return any(character.isalpha() for character in line)

    @staticmethod
    def merge_similar_name_lines(previous_name, next_line):
        from difflib import SequenceMatcher
        previous_name = (previous_name or "").strip()
        next_line = (next_line or "").strip()
        if not previous_name:
            return next_line
        if not next_line:
            return previous_name
        previous_words = previous_name.split()
        next_words = next_line.split()
        similarity = SequenceMatcher(None, previous_name.lower(), next_line.lower()).ratio()
        if similarity > 0.72:
            return previous_name
        if next_words and next_words[0].lower() in {word.lower() for word in previous_words[-2:]}:
            return previous_name
        if previous_words and next_words and previous_words[-1].lower() == next_words[0].lower():
            return previous_name
        if previous_name.endswith("-"):
            return f"{previous_name[:-1]}{next_line}".strip()
        return f"{previous_name} {next_line}".strip()
