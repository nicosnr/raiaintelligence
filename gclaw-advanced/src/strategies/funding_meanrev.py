"""Funding-rate mean-reversion strategy.

Perp funding rates that push far above (or below) a venue's rolling
median tend to mean-revert — pay too much to be long, and the long
side eventually unwinds. This strategy fades the extreme:

  - z > +threshold  → short perp
  - z < -threshold  → long perp

Confidence scales with |z|. Halts around funding tick times (top-of-hour
on HL) so we don't get run over by the payment itself.
"""

from __future__ import annotations

import statistics
import time
from dataclasses import dataclass
from typing import Iterable

from src.risk_engine import Candidate, Regime
from src.strategies import StrategyContext
from src.strategies.copy_trade import CLUSTER_MAP


@dataclass
class FundingMeanRev:
    name: str = "funding_meanrev"
    z_threshold: float = 2.0
    z_max_takeable: float = 5.0
    reward_to_risk: float = 1.8
    min_samples: int = 24
    hush_around_funding_seconds: int = 90

    def propose(self, ctx: StrategyContext) -> list[Candidate]:
        out: list[Candidate] = []
        # Skip within N seconds of top-of-hour funding print
        secs_into_hour = int(ctx.now_ts) % 3600
        if secs_into_hour < self.hush_around_funding_seconds \
                or secs_into_hour > 3600 - self.hush_around_funding_seconds:
            return out

        for coin, hist in ctx.funding_history.items():
            samples = list(hist)
            if len(samples) < self.min_samples:
                continue
            median = statistics.median(samples[:-1])
            sd = statistics.pstdev(samples[:-1]) or 1e-9
            z = (samples[-1] - median) / sd
            if abs(z) < self.z_threshold or abs(z) > self.z_max_takeable:
                continue
            snap = ctx.snapshots.get(coin)
            if not snap or snap.ask <= 0 or snap.bid <= 0:
                continue
            mid = (snap.ask + snap.bid) / 2
            vol_est = max((snap.ask - snap.bid) / mid, 0.001) * 15
            side = "short" if z > 0 else "long"
            # extreme funding → high confidence trade
            p = 0.5 + min(abs(z) - self.z_threshold, 2.0) * 0.04
            out.append(Candidate(
                symbol=f"{coin}-PERP",
                cluster=CLUSTER_MAP.get(coin, "alt_large"),
                side=side,
                p_up_calibrated=p if side == "long" else 1 - p,
                reward_to_risk=self.reward_to_risk,
                horizon_vol=vol_est,
                correlation_to_open=0.0,
                expected_cost_bps=6.0,
                regime=Regime.RANGE,
                venue="hyperliquid",
            ))
        return out
