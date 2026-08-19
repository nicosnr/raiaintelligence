"""Paper venue — mirrors a real venue but never touches the wire.

Reads top-of-book from a SnapshotCache (real or synthetic), simulates
fills at market with configurable slippage, tracks fills for drift
analysis against the paired live venue.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field

from src.execution import Fill, OrderIntent, OrderKind
from src.venues.hyperliquid import SnapshotCache, _coin


@dataclass
class PaperVenue:
    name: str = "paper"
    cache: SnapshotCache = field(default_factory=SnapshotCache)
    taker_bps: float = 3.5
    maker_bps: float = 1.0
    slip_bps: float = 2.0
    fills: list[Fill] = field(default_factory=list)

    async def top_of_book(self, symbol: str) -> tuple[float, float, float, float]:
        s = self.cache.get(_coin(symbol))
        return s.bid, s.bid_sz, s.ask, s.ask_sz

    async def est_fee_bps(self, symbol: str, kind: OrderKind) -> float:
        return self.maker_bps if kind == OrderKind.LIMIT else self.taker_bps

    async def submit(self, intent: OrderIntent) -> Fill:
        s = self.cache.get(_coin(intent.symbol))
        px = s.ask if intent.side == "buy" else s.bid
        if px <= 0:
            # If we have a last trade, fall back to it; else refuse.
            if s.last_trade_px <= 0:
                raise RuntimeError(f"paper_no_price_{intent.symbol}")
            px = s.last_trade_px
        slip = self.slip_bps / 10_000
        px = px * (1 + slip) if intent.side == "buy" else px * (1 - slip)
        fill = Fill(
            order_id="paper-" + uuid.uuid4().hex[:12],
            symbol=intent.symbol,
            side=intent.side,
            price=px,
            notional_usd=intent.notional_usd,
            venue=self.name,
            paper=True,
        )
        self.fills.append(fill)
        return fill

    def drift_bps_vs(self, other_fills: list[Fill]) -> float | None:
        """Average signed drift (bps) between paired paper and live fills."""
        pairs = [
            (p.price, o.price) for p, o in zip(self.fills, other_fills)
            if p.symbol == o.symbol and p.side == o.side
        ]
        if not pairs:
            return None
        return sum((live - paper) / paper * 10_000 for paper, live in pairs) / len(pairs)
