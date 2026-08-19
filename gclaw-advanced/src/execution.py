"""Execution layer — smart routing, TWAP slicing, paper-shadow ordering.

Live venues are behind an adapter interface so the same logic drives paper,
testnet, and mainnet. Every live order emits a matched paper-shadow order
whose fills feed the drift calibrator.
"""

from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Protocol


class OrderKind(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    TWAP_SLICE = "twap_slice"


@dataclass
class OrderIntent:
    symbol: str
    side: str            # "buy" | "sell"
    notional_usd: float
    kind: OrderKind
    limit_price: float | None = None
    take_profit: float | None = None
    stop_loss: float | None = None
    tag: str = ""


@dataclass
class Fill:
    order_id: str
    symbol: str
    side: str
    price: float
    notional_usd: float
    venue: str
    ts: float = field(default_factory=time.time)
    paper: bool = False


class Venue(Protocol):
    name: str
    async def top_of_book(self, symbol: str) -> tuple[float, float, float, float]: ...   # (bid, bid_sz, ask, ask_sz)
    async def submit(self, intent: OrderIntent) -> Fill: ...
    async def est_fee_bps(self, symbol: str, kind: OrderKind) -> float: ...


@dataclass
class RouteQuote:
    venue: str
    expected_price: float
    expected_slippage_bps: float
    fee_bps: float


async def route(intent: OrderIntent, venues: list[Venue]) -> RouteQuote:
    quotes: list[RouteQuote] = []
    for v in venues:
        bid, bid_sz, ask, ask_sz = await v.top_of_book(intent.symbol)
        mid = (bid + ask) / 2 if (bid and ask) else 0.0
        if mid <= 0:
            continue
        px = ask if intent.side == "buy" else bid
        depth = ask_sz if intent.side == "buy" else bid_sz
        slippage_bps = (abs(px - mid) / mid) * 10_000 + max(
            0.0, (intent.notional_usd / max(depth * mid, 1e-9) - 1.0) * 100
        )
        fee = await v.est_fee_bps(intent.symbol, intent.kind)
        quotes.append(RouteQuote(v.name, px, slippage_bps, fee))
    if not quotes:
        raise RuntimeError("no_venue_quoted")
    return min(quotes, key=lambda q: q.expected_slippage_bps + q.fee_bps)


async def twap_slice(intent: OrderIntent, venue: Venue, n: int, interval_s: float) -> list[Fill]:
    """Split an oversized intent into equal time-spaced slices."""
    slice_notional = intent.notional_usd / n
    fills: list[Fill] = []
    for i in range(n):
        slice_intent = OrderIntent(
            symbol=intent.symbol, side=intent.side,
            notional_usd=slice_notional, kind=OrderKind.MARKET,
            take_profit=intent.take_profit, stop_loss=intent.stop_loss,
            tag=intent.tag + f":twap{i+1}/{n}",
        )
        fills.append(await venue.submit(slice_intent))
        if i < n - 1:
            await asyncio.sleep(interval_s)
    return fills


async def execute(intent: OrderIntent, venues: list[Venue], paper_venue: Venue,
                  max_slippage_bps: float = 25.0, twap_book_fraction: float = 0.05) -> list[Fill]:
    quote = await route(intent, venues)
    if quote.expected_slippage_bps > max_slippage_bps:
        raise RuntimeError(f"slippage_gate_{quote.expected_slippage_bps:.1f}bps")

    chosen = next(v for v in venues if v.name == quote.venue)
    bid, bid_sz, ask, ask_sz = await chosen.top_of_book(intent.symbol)
    top_depth_usd = (bid_sz if intent.side == "sell" else ask_sz) * ((bid + ask) / 2)

    if intent.notional_usd > twap_book_fraction * top_depth_usd:
        n = max(4, int(intent.notional_usd / (twap_book_fraction * top_depth_usd)))
        n = min(n, 20)
        fills = await twap_slice(intent, chosen, n=n, interval_s=15)
    else:
        fills = [await chosen.submit(intent)]

    # paper shadow — always
    shadow_fill = await paper_venue.submit(intent)
    shadow_fill.paper = True
    fills.append(shadow_fill)
    return fills
