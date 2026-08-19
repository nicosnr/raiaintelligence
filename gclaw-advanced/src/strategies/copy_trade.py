"""Filtered copy-trading strategy.

Mirrors position changes from the top-N HyperLiquid leaders that pass a
quality filter (min track days, Sortino, drawdown). Emits a Candidate
per leader-approved coin per heartbeat, sized proportionally to the
leader's own position weight.

Filter thresholds live in config; hard-coded defaults here match
config/config.template.json.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from src.risk_engine import Candidate, Regime
from src.strategies import StrategyContext


@dataclass
class LeaderSnapshot:
    address: str
    track_days: int
    sortino_60d: float
    max_drawdown_60d: float
    trades_60d: int
    last10_lose_streak: int
    positions: dict[str, float]     # coin -> notional_usd (signed)
    confidence: float               # 0..1 self-reported / meta-learned


DEFAULT_FILTER = dict(
    min_track_days=60,
    min_sortino_60d=2.0,
    max_drawdown_60d=0.25,
    min_trades_60d=40,
    max_last10_lose_streak=3,
)

CLUSTER_MAP = {
    "BTC": "btc_beta", "WBTC": "btc_beta",
    "ETH": "eth_beta", "STETH": "eth_beta",
    "SOL": "sol_beta",
}


@dataclass
class CopyTrade:
    name: str = "copy_trade"
    size_scale_of_leader: float = 0.3
    max_leaders: int = 3
    default_reward_to_risk: float = 2.5
    filter_cfg: dict = field(default_factory=lambda: dict(DEFAULT_FILTER))

    def _passes(self, l: LeaderSnapshot) -> bool:
        f = self.filter_cfg
        return (
            l.track_days >= f["min_track_days"]
            and l.sortino_60d >= f["min_sortino_60d"]
            and l.max_drawdown_60d <= f["max_drawdown_60d"]
            and l.trades_60d >= f["min_trades_60d"]
            and l.last10_lose_streak <= f["max_last10_lose_streak"]
        )

    def propose(self, ctx: StrategyContext) -> list[Candidate]:
        approved: list[LeaderSnapshot] = [l for l in ctx.copy_leaders if self._passes(l)]
        approved.sort(key=lambda l: l.sortino_60d, reverse=True)
        approved = approved[: self.max_leaders]

        out: list[Candidate] = []
        seen_coin: set[str] = set()
        for leader in approved:
            for coin, leader_notional in leader.positions.items():
                if coin in seen_coin or leader_notional == 0:
                    continue
                seen_coin.add(coin)
                snap = ctx.snapshots.get(coin)
                if not snap or snap.ask <= 0 or snap.bid <= 0:
                    continue
                mid = (snap.ask + snap.bid) / 2
                vol_est = max((snap.ask - snap.bid) / mid, 0.001) * 20  # rough
                out.append(Candidate(
                    symbol=f"{coin}-PERP",
                    cluster=CLUSTER_MAP.get(coin, "alt_large"),
                    side="long" if leader_notional > 0 else "short",
                    p_up_calibrated=0.5 + min(leader.sortino_60d, 5.0) * 0.02,
                    reward_to_risk=self.default_reward_to_risk,
                    horizon_vol=vol_est,
                    correlation_to_open=0.0,
                    expected_cost_bps=8.0,
                    regime=Regime.RANGE,  # regime filled by orchestrator
                    venue="hyperliquid",
                ))
        return out
