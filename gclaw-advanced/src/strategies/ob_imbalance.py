"""Orderbook imbalance strategy.

Simple, fast, and reliably positive on liquid perp names when combined
with a real regime filter (trending or ranging, not chop).

Signal:
  imbalance = (top_bid_size - top_ask_size) / (top_bid_size + top_ask_size)

Interpretation:
  imbalance > +tau  →  bid pressure > ask, expect up-tick, go long
  imbalance < -tau  →  ask pressure > bid, expect down-tick, go short

We only propose when the depth is *materially* imbalanced and the
top-of-book is deep enough that the signal isn't just one whale.
"""

from __future__ import annotations

from dataclasses import dataclass

from src.risk_engine import Candidate, Regime
from src.strategies import StrategyContext
from src.strategies.copy_trade import CLUSTER_MAP


@dataclass
class OrderbookImbalance:
    name: str = "ob_imbalance"
    tau: float = 0.30
    min_top_depth_usd: float = 5_000.0
    reward_to_risk: float = 1.6

    def propose(self, ctx: StrategyContext) -> list[Candidate]:
        out: list[Candidate] = []
        for coin, snap in ctx.snapshots.items():
            if snap.bid <= 0 or snap.ask <= 0:
                continue
            mid = (snap.bid + snap.ask) / 2
            top_depth_usd = (snap.bid_sz + snap.ask_sz) * mid
            if top_depth_usd < self.min_top_depth_usd:
                continue
            imb = (snap.bid_sz - snap.ask_sz) / (snap.bid_sz + snap.ask_sz)
            if abs(imb) < self.tau:
                continue
            vol_est = max((snap.ask - snap.bid) / mid, 0.001) * 10
            side = "long" if imb > 0 else "short"
            p = 0.5 + min(abs(imb) - self.tau, 0.5) * 0.10
            out.append(Candidate(
                symbol=f"{coin}-PERP",
                cluster=CLUSTER_MAP.get(coin, "alt_large"),
                side=side,
                p_up_calibrated=p if side == "long" else 1 - p,
                reward_to_risk=self.reward_to_risk,
                horizon_vol=vol_est,
                correlation_to_open=0.0,
                expected_cost_bps=7.0,
                regime=Regime.RANGE,
                venue="hyperliquid",
            ))
        return out
