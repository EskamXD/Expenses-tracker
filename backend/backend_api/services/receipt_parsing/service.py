import re

from .canonicalizer import ItemCanonicalizer
from .extractors import ReceiptTextExtractor
from .registry import ReceiptParserRegistry
from .store_detector import StoreDetector


class ReceiptParsingService:
    DATE_RE = re.compile(r"\b(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})\b")

    def __init__(self):
        self.extractor = ReceiptTextExtractor()
        self.store_detector = StoreDetector()
        self.registry = ReceiptParserRegistry()
        self.canonicalizer = ItemCanonicalizer()

    def parse_pdf(self, uploaded_file):
        extracted = self.extractor.extract(uploaded_file)
        text = extracted["text"]
        warning = extracted.get("warning")

        if not text.strip():
            return {
                "shop": "",
                "payment_date": None,
                "items": [],
                "raw_text": "",
                "warning": warning,
            }

        shop = self.store_detector.detect_shop_name(text, self.DATE_RE)
        store_type = self.store_detector.detect_store_type(shop, text)
        parser = self.registry.get_parser(store_type, text)
        items = parser.parse(text)

        item_dictionary = self.canonicalizer.build_dictionary()
        items = self.canonicalizer.canonicalize_items(items, item_dictionary)

        return {
            "shop": shop,
            "payment_date": self.extract_date(text),
            "items": items,
            "raw_text": text,
            "warning": warning,
        }

    def extract_date(self, text):
        match = self.DATE_RE.search(text)
        if not match:
            return None

        raw = match.group(1).replace("/", "-").replace(".", "-")
        if re.match(r"^\d{4}-\d{2}-\d{2}$", raw):
            return raw

        day, month, year = raw.split("-")
        return f"{year}-{month}-{day}"
