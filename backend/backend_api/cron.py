import yfinance as yf
from .models import Instrument


def update_instruments_prices():
    instruments = Instrument.objects.all()
    for instrument in instruments:
        ticker = yf.Ticker(instrument.symbol)
        price = ticker.info.get("regularMarketPrice")
        if price is not None:
            instrument.current_price = price
            instrument.save()
