"""HyperLiquid venue adapter — WS market data + REST order submission.

Uses only stdlib for market data streaming (via a WS client the caller
provides) and a tiny requests-style POST for order submission. In
production, wire this to the official hyperliquid-python-sdk. This
module keeps interface parity with src.execution.Venue.

The WS protocol reference: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable

from src.execution import Fill, OrderIntent, OrderKind
from src.market_data import Subscription

logger = logging.getLogger("gclaw.venues.hl")

HL_WS_URL = "wss://api.hyperliquid.xyz/ws"
HL_REST_URL = "https://api.hyperliquid.xyz"


# ---------------------------------------------------------------------------
# Market data — WS subscription factories usable with SupervisedStream
# ---------------------------------------------------------------------------

class WSClient:
    """Thin async interface abstraction over websockets.WebSocketClientProtocol.

    We define a Protocol-like shape here so the adapter tests can pass a
    stub client, and the production wiring uses `websockets.connect(...)`.
    """

    async def send(self, data: str) -> None: ...
    async def recv(self) -> str: ...
    async def close(self) -> None: ...


ConnectFn = Callable[[str], Awaitable[WSClient]]
"""Injected websocket-open factory. In prod: `websockets.connect(url)`."""


def orderbook_stream(coin: str, connect: ConnectFn) -> Callable[[Subscription], Awaitable[None]]:
    """Return a connect_and_stream coroutine for HL orderbook of `coin`."""

    async def _stream(sub: Subscription) -> None:
        ws = await connect(HL_WS_URL)
        try:
            payload = {"method": "subscribe", "subscription": {"type": "l2Book", "coin": coin}}
            await ws.send(json.dumps(payload))
            while True:
                raw = await ws.recv()
                msg = json.loads(raw)
                # HL wraps data: {"channel":"l2Book","data":{"coin":..,"levels":[[bids],[asks]],"time":..}}
                if msg.get("channel") == "l2Book":
                    sub.publish(msg["data"])
        finally:
            await ws.close()

    return _stream


def trades_stream(coin: str, connect: ConnectFn) -> Callable[[Subscription], Awaitable[None]]:
    async def _stream(sub: Subscription) -> None:
        ws = await connect(HL_WS_URL)
        try:
            await ws.send(json.dumps({
                "method": "subscribe",
                "subscription": {"type": "trades", "coin": coin},
            }))
            while True:
                raw = await ws.recv()
                msg = json.loads(raw)
                if msg.get("channel") == "trades":
                    for t in msg["data"]:
                        sub.publish(t)
        finally:
            await ws.close()

    return _stream


def funding_stream(coin: str, connect: ConnectFn) -> Callable[[Subscription], Awaitable[None]]:
    """HL exposes funding via activeAssetCtx WS; parse `funding` field."""

    async def _stream(sub: Subscription) -> None:
        ws = await connect(HL_WS_URL)
        try:
            await ws.send(json.dumps({
                "method": "subscribe",
                "subscription": {"type": "activeAssetCtx", "coin": coin},
            }))
            while True:
                raw = await ws.recv()
                msg = json.loads(raw)
                if msg.get("channel") == "activeAssetCtx":
                    data = msg["data"]
                    if "funding" in data:
                        sub.publish({"coin": coin, "funding": float(data["funding"]),
                                     "ts": time.time()})
        finally:
            await ws.close()

    return _stream


# ---------------------------------------------------------------------------
# Latest-tick cache — a per-coin snapshot fed from the streams above
# ---------------------------------------------------------------------------

@dataclass
class Snapshot:
    bid: float = 0.0
    bid_sz: float = 0.0
    ask: float = 0.0
    ask_sz: float = 0.0
    last_trade_px: float = 0.0
    funding: float = 0.0
    ts: float = 0.0


class SnapshotCache:
    """Consumes queues from the fabric and keeps the latest snapshot per coin."""

    def __init__(self) -> None:
        self._snaps: dict[str, Snapshot] = {}
        self._tasks: list[asyncio.Task] = []

    def get(self, coin: str) -> Snapshot:
        return self._snaps.setdefault(coin, Snapshot())

    def attach_orderbook(self, coin: str, q: asyncio.Queue) -> None:
        async def _consume():
            while True:
                msg = await q.get()
                # HL l2Book: levels = [bids, asks], each an array of {"px":str, "sz":str, "n":int}
                levels = msg.get("levels") or [[], []]
                bids, asks = levels[0], levels[1]
                s = self.get(coin)
                if bids:
                    s.bid = float(bids[0]["px"]); s.bid_sz = float(bids[0]["sz"])
                if asks:
                    s.ask = float(asks[0]["px"]); s.ask_sz = float(asks[0]["sz"])
                s.ts = time.time()
        self._tasks.append(asyncio.create_task(_consume(), name=f"snap:ob:{coin}"))

    def attach_trades(self, coin: str, q: asyncio.Queue) -> None:
        async def _consume():
            while True:
                t = await q.get()
                s = self.get(coin)
                try:
                    s.last_trade_px = float(t["px"])
                    s.ts = time.time()
                except (KeyError, ValueError):
                    continue
        self._tasks.append(asyncio.create_task(_consume(), name=f"snap:tr:{coin}"))

    def attach_funding(self, coin: str, q: asyncio.Queue) -> None:
        async def _consume():
            while True:
                f = await q.get()
                s = self.get(coin)
                s.funding = float(f["funding"])
                s.ts = time.time()
        self._tasks.append(asyncio.create_task(_consume(), name=f"snap:fd:{coin}"))

    async def stop(self) -> None:
        for t in self._tasks:
            t.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)


# ---------------------------------------------------------------------------
# Venue Protocol implementation
# ---------------------------------------------------------------------------

RestPoster = Callable[[str, dict], Awaitable[dict]]
"""Injected async POSTer. In prod, wrap httpx.AsyncClient.post to HL_REST_URL."""


class HyperLiquidVenue:
    name = "hyperliquid"

    def __init__(self, cache: SnapshotCache, poster: RestPoster,
                 taker_fee_bps: float = 3.5, maker_fee_bps: float = 1.0) -> None:
        self.cache = cache
        self.poster = poster
        self.taker_bps = taker_fee_bps
        self.maker_bps = maker_fee_bps

    async def top_of_book(self, symbol: str) -> tuple[float, float, float, float]:
        s = self.cache.get(_coin(symbol))
        return s.bid, s.bid_sz, s.ask, s.ask_sz

    async def est_fee_bps(self, symbol: str, kind: OrderKind) -> float:
        return self.maker_bps if kind == OrderKind.LIMIT else self.taker_bps

    async def submit(self, intent: OrderIntent) -> Fill:
        coin = _coin(intent.symbol)
        s = self.cache.get(coin)
        px = s.ask if intent.side == "buy" else s.bid
        if px <= 0:
            raise RuntimeError(f"no_top_of_book_for_{coin}")
        payload = {
            "type": "order",
            "coin": coin,
            "side": intent.side,
            "kind": intent.kind.value,
            "notional_usd": intent.notional_usd,
            "limit_price": intent.limit_price,
            "reduce_only": False,
            "tag": intent.tag,
        }
        # In production, sign & submit via HL's REST /exchange endpoint.
        resp = await self.poster("/exchange", payload)
        filled_px = float(resp.get("avg_price", px))
        return Fill(
            order_id=str(resp.get("order_id", "sim")),
            symbol=intent.symbol,
            side=intent.side,
            price=filled_px,
            notional_usd=intent.notional_usd,
            venue=self.name,
        )


def _coin(symbol: str) -> str:
    """'BTC-PERP' -> 'BTC'. HL's WS API uses bare coin tickers."""
    return symbol.split("-", 1)[0]
