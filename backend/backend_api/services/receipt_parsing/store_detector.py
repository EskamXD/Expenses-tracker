import re
from difflib import SequenceMatcher


class StoreDetector:
    def detect_shop_name(self, text, date_re):
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        preferred_patterns = [
            ("kaufland", re.compile(r"\bkaufland\b", re.IGNORECASE)),
            ("biedronka", re.compile(r"\bbiedronka\b", re.IGNORECASE)),
            ("lidl", re.compile(r"\blidl\b", re.IGNORECASE)),
            ("żabka", re.compile(r"\bżabka\b|\bzabka\b", re.IGNORECASE)),
            ("netto", re.compile(r"\bnetto\b", re.IGNORECASE)),
            ("rossmann", re.compile(r"\brossmann\b", re.IGNORECASE)),
        ]

        for line in lines[:15]:
            for _, pattern in preferred_patterns:
                if pattern.search(line):
                    return line

        for line in lines[:15]:
            normalized_alpha = re.sub(r"[^a-ząćęłńóśźż]", "", line.lower())
            if not normalized_alpha:
                continue
            for store_name, _ in preferred_patterns:
                similarity = SequenceMatcher(None, normalized_alpha, store_name).ratio()
                if similarity >= 0.65 or store_name in normalized_alpha:
                    return line

        for line in lines[:10]:
            normalized_line = line.lower()
            if (
                len(line) > 2
                and not date_re.search(line)
                and not any(char.isdigit() for char in normalized_line[:8])
            ):
                return line

        return ""

    def detect_store_type(self, shop, text):
        haystack = " ".join([shop or "", text[:500]]).lower()
        normalized = re.sub(r"[^a-ząćęłńóśźż]", "", haystack)

        if "kaufland" in normalized:
            return "kaufland"
        if "biedronka" in normalized:
            return "biedronka"

        if SequenceMatcher(None, normalized[:40], "biedronka").ratio() >= 0.55:
            return "biedronka"

        for line in text.splitlines()[:15]:
            line_normalized = re.sub(r"[^a-ząćęłńóśźż]", "", line.lower())
            if not line_normalized:
                continue
            if SequenceMatcher(None, line_normalized, "biedronka").ratio() >= 0.65:
                return "biedronka"
            if SequenceMatcher(None, line_normalized, "kaufland").ratio() >= 0.70:
                return "kaufland"

        return ""
