from .parsers import BiedronkaReceiptParser, GenericReceiptParser, KauflandReceiptParser


class ReceiptParserRegistry:
    def __init__(self):
        self.parsers = [
            KauflandReceiptParser(),
            BiedronkaReceiptParser(),
            GenericReceiptParser(),
        ]

    def get_parser(self, store_type: str, text: str):
        for parser in self.parsers:
            if parser.matches(store_type, text):
                return parser
        return GenericReceiptParser()
