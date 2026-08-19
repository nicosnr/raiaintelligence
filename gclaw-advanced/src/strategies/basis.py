"""Cross-venue basis (arbitrage) strategy.

When the same asset trades at materially different prices on two
venues, the wider price *usually* converges to the tighter one within
minutes. This strategy proposes matched-notional legs — long the cheap
venue, short the expensive one — sized so the *net* directional
exposure is near zero.

The Candidate emitted here always carries `regime=Regime.DISLOCATED`
so the risk engine routes it into the arb-only path even when
discretionary trading is disabled in the current regime.
"""

from __future__ import annotations

import time
from dataclasses import dataclass

from src.risk_engine import Candidate, Regime
from src.strategies import StrategyContext
from src.strategies.copy_trade import CLUSTER_MAP


@dataclass
class CrossVenueBasis:
    name: str = "basis_arb"
    min_bps_edge_after_cost: float = 20.0
    default_reward_to_risk: float = 3.0

    def propose(self, ctx: StrategyContext) -> list[Candidate]:
        out: list[Candidate] = []
        for coin, mids in ctx.cross_venue_mid.items():
            if len(mids) < 2:
                continue
            cheap = min(mids.items(), key=lambda kv: kv[1])
            expensive = max(mids.items(), key=lambda kv: kv[1])
            if cheap[1] <= 0 or expensive[1] <= 0:
                continue
            spread_bps = (expensive[1] - cheap[1]) / cheap[1] * 10_000
            round_trip_cost_bps = 12.0  # 2 legs, taker+slip
            if spread_bps - round_trip_cost_bps < self.min_bps_edge_after_cost:
                continue
            # Two Candidates: long the cheap venue, short the expensive
            base_kwargs = dict(
                cluster=CLUSTER_MAP.get(coin, "alt_large"),
                p_up_calibrated=0.75,
                reward_to_risk=self.default_reward_to_risk,
                horizon_vol=0.005,
                correlation_to_open=-1.0,  # legs offset each other
                expected_cost_bps=round_trip_cost_bps,
                regime=Regime.DISLOCATED,
            )
            out.append(Candidate(symbol=f"{coin}-PERP", side="long",
                                 venue=cheap[0], **base_kwargs))
            out.append(Candidate(symbol=f"{coin}-PERP", side="short",
                                 venue=expensive[0], **base_kwargs))
        return out
