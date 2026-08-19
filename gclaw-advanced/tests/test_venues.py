"""Venue tests — HyperLiquid orderbook parsing + paper venue fills."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.execution import OrderIntent, OrderKind
from src.venues.hyperliquid import HyperLiquidVenue, SnapshotCache
from src.venues.paper import PaperVenue


class _StubWS:
    """Emits one canned l2Book message then blocks forever."""

    def __init__(self, msg: dict):
        self._msg = msg
        self._sent: list[str] = []
        self._done = asyncio.Event()

    async def send(self, data: str) -> None:
        self._sent.append(data)

    async def recv(self) -> str:
        import json
        # Yield once, then hang so the supervisor treats it as alive
        if not self._done.is_set():
            self._done.set()
            return json.dumps(self._msg)
        await asyncio.sleep(3600)
        return "{}"

    async def close(self) -> None:
        pass


def test_orderbook_stream_parses_l2book_top_of_book():
    from src.venues.hyperliquid import orderbook_stream, HL_WS_URL
    from src.market_data import MarketDataFabric

    async def scenario():
        canned = {
            "channel": "l2Book",
            "data": {
                "coin": "BTC",
                "levels": [
                    [{"px": "60000.0", "sz": "2.5", "n": 4}],
                    [{"px": "60005.0", "sz": "1.5", "n": 2}],
                ],
                "time": 0,
            },
        }
        cache = SnapshotCache()
        stub = _StubWS(canned)

        async def connect(url: str):
            assert url == HL_WS_URL
            return stub

        fabric = MarketDataFabric()
        sub = fabric.register("BTC.ob", orderbook_stream("BTC", connect),
                              expected_msgs_per_second=1)
        q = sub.subscribe()
        cache.attach_orderbook("BTC", q)
        fabric.start_all()
        try:
            # Wait for the canned message to propagate
            for _ in range(100):
                s = cache.get("BTC")
                if s.bid > 0 and s.ask > 0:
                    break
                await asyncio.sleep(0.02)
            s = cache.get("BTC")
            assert s.bid == 60000.0 and s.bid_sz == 2.5
            assert s.ask == 60005.0 and s.ask_sz == 1.5
        finally:
            await fabric.stop_all()
            await cache.stop()

    asyncio.run(scenario())


def test_paper_venue_fill_applies_slippage_in_correct_direction():
    async def scenario():
        cache = SnapshotCache()
        s = cache.get("BTC")
        s.bid, s.bid_sz, s.ask, s.ask_sz = 60000.0, 2.0, 60005.0, 2.0
        venue = PaperVenue(cache=cache, slip_bps=5.0)
        buy = await venue.submit(OrderIntent(
            symbol="BTC-PERP", side="buy", notional_usd=100.0, kind=OrderKind.MARKET,
        ))
        sell = await venue.submit(OrderIntent(
            symbol="BTC-PERP", side="sell", notional_usd=100.0, kind=OrderKind.MARKET,
        ))
        # buy above ask, sell below bid
        assert buy.price > 60005.0
        assert sell.price < 60000.0
        assert buy.paper and sell.paper

    asyncio.run(scenario())


def test_hyperliquid_venue_submit_posts_and_returns_fill():
    async def scenario():
        cache = SnapshotCache()
        s = cache.get("BTC")
        s.bid, s.bid_sz, s.ask, s.ask_sz = 60000.0, 2.0, 60005.0, 2.0

        posted: list[tuple[str, dict]] = []

        async def poster(path: str, payload: dict) -> dict:
            posted.append((path, payload))
            return {"order_id": "abc123", "avg_price": 60007.5}

        venue = HyperLiquidVenue(cache, poster)
        fill = await venue.submit(OrderIntent(
            symbol="BTC-PERP", side="buy", notional_usd=100.0, kind=OrderKind.MARKET,
            tag="test",
        ))
        assert fill.order_id == "abc123"
        assert fill.price == 60007.5
        assert posted[0][0] == "/exchange"
        assert posted[0][1]["coin"] == "BTC"

    asyncio.run(scenario())


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn(); print(f"ok    {name}")
            except AssertionError as e:
                print(f"FAIL  {name}: {e}")
