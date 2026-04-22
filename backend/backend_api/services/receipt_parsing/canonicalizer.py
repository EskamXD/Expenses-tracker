import re
from collections import defaultdict
from difflib import SequenceMatcher

from backend_api.models import Item


class ItemCanonicalizer:
    def build_dictionary(self):
        raw_descriptions = (
            Item.objects.exclude(description__isnull=True)
            .exclude(description__exact="")
            .values_list("description", flat=True)
            .distinct()
        )

        normalized_map = defaultdict(list)
        descriptions = []

        for description in raw_descriptions:
            cleaned_description = (description or "").strip()
            if not cleaned_description:
                continue

            descriptions.append(cleaned_description)
            normalized_map[self.normalize_text(cleaned_description)].append(
                cleaned_description
            )

        return {"descriptions": descriptions, "normalized_map": dict(normalized_map)}

    def canonicalize_items(self, items, item_dictionary):
        result = []
        for item in items:
            copied = dict(item)
            copied["description"] = self.canonicalize_description(
                copied.get("description", ""),
                item_dictionary=item_dictionary,
            )
            result.append(copied)
        return result

    def canonicalize_description(self, description, item_dictionary=None):
        cleaned_description = (description or "").strip()
        if not cleaned_description or not item_dictionary:
            return cleaned_description

        normalized_description = self.normalize_text(cleaned_description)
        if not normalized_description:
            return cleaned_description

        normalized_map = item_dictionary.get("normalized_map", {})
        exact_candidates = normalized_map.get(normalized_description)
        if exact_candidates:
            return max(exact_candidates, key=len)

        best_match = None
        best_score = 0.0
        description_tokens = set(normalized_description.split())

        for candidate in item_dictionary.get("descriptions", []):
            normalized_candidate = self.normalize_text(candidate)
            if not normalized_candidate:
                continue

            similarity = SequenceMatcher(None, normalized_description, normalized_candidate).ratio()
            candidate_tokens = set(normalized_candidate.split())
            token_overlap = 0.0
            if description_tokens and candidate_tokens:
                token_overlap = len(description_tokens & candidate_tokens) / max(
                    len(description_tokens), len(candidate_tokens)
                )

            score = max(similarity, (similarity * 0.7) + (token_overlap * 0.3))
            if score > best_score:
                best_score = score
                best_match = candidate

        if best_match and best_score >= 0.74:
            return best_match

        return cleaned_description

    @staticmethod
    def normalize_text(value):
        normalized = (value or "").lower()
        normalized = normalized.replace("ł", "l").replace("ó", "o").replace("ą", "a")
        normalized = normalized.replace("ę", "e").replace("ś", "s").replace("ć", "c")
        normalized = normalized.replace("ż", "z").replace("ź", "z").replace("ń", "n")
        normalized = re.sub(r"\b[abcdn]\b", " ", normalized)
        normalized = re.sub(r"\b\d+[,.]\d{3}\s*[x×*]\s*\d+[,.]\d{2}\b", " ", normalized)
        normalized = re.sub(r"\b\d+[,.]\d{2}\b", " ", normalized)
        normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized
