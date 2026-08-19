"""Risk Engine — position sizing, portfolio caps, circuit breakers.

Reference implementation. The math here matches docs/RISK_MODEL.md.
Nothing in this module ever contacts a market — it is pure decision logic
that returns either a sized order intent or a rejection with a reason.
"""

from __future__ import annotations

import math
import os
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Iterable


class Regime(str, Enum):
    TREND_UP = "trend_up"
    TREND_DOWN = "trend_down"
    RANGE = "range"
    CHOP = "chop"
    VOL_SPIKE = "vol_spike"
    DISLOCATED = "dislocated"


class Stage(str, Enum):
    SEED = "seed"
    PROVE = "prove"
    GROW = "grow"
    SCALE = "scale"
    COMPOUND = "compound"


@dataclass
class Candidate:
    symbol: str
    cluster: str
    side: str
    p_up_calibrated: float
    reward_to_risk: float
    horizon_vol: float
    correlation_to_open: float
    expected_cost_bps: float
    regime: Regime
    venue: str


@dataclass
class Position:
    symbol: str
    cluster: str
    notional_usd: float
    liquidation_distance: float


@dataclass
class RiskState:
    equity_usd: float
    stage: Stage
    open_positions: list[Position] = field(default_factory=list)
    consecutive_losses: int = 0
    equity_at_utc_midnight: float = 0.0
    gmac_burn_24h_fraction: float = 0.0
    data_uptime_5m: float = 1.0
    funding_zscore: float = 0.0


@dataclass
class Decision:
    accepted: bool
    notional_usd: float = 0.0
    leverage: float = 0.0
    stop_loss: float = 0.0
    take_profit: float = 0.0
    reason: str = ""


STAGE_KELLY: dict[Stage, float] = {
    Stage.SEED: 0.10,
    Stage.PROVE: 0.15,
    Stage.GROW: 0.20,
    Stage.SCALE: 0.25,
    Stage.COMPOUND: 0.30,
}

STAGE_MAX_LEVERAGE: dict[Stage, int] = {
    Stage.SEED: 3,
    Stage.PROVE: 5,
    Stage.GROW: 8,
    Stage.SCALE: 12,
    Stage.COMPOUND: 15,
}

REGIME_LEVERAGE_MULTIPLIER: dict[Regime, float] = {
    Regime.TREND_UP: 1.0,
    Regime.TREND_DOWN: 1.0,
    Regime.RANGE: 0.4,
    Regime.CHOP: 0.15,
    Regime.VOL_SPIKE: 0.20,
    Regime.DISLOCATED: 0.0,
}

CLUSTER_CAPS: dict[str, float] = {
    "btc_beta": 0.60,
    "eth_beta": 0.50,
    "sol_beta": 0.40,
    "alt_large": 0.35,
    "alt_small": 0.15,
    "memes": 0.05,
    "stables": 1.0,
}

VOL_TARGET_DAILY = 0.02
STOP_LOSS_FLOOR = 0.03
STOP_LOSS_VOL_MULT = 1.5
TP_R_MULT_DEFAULT = 2.5
PORTFOLIO_MAX_GROSS = 3.0
CVAR_5_CAP_FRACTION = 0.15
KILL_SWITCH_FILE = "/tmp/gclaw.halt"


def full_kelly(p: float, b: float) -> float:
    """Full Kelly fraction. Negative means edge is against — do not trade."""
    if b <= 0:
        return 0.0
    return (b * p - (1.0 - p)) / b


def cluster_used_fraction(state: RiskState, cluster: str) -> float:
    if state.equity_usd <= 0:
        return math.inf
    used = sum(abs(p.notional_usd) for p in state.open_positions if p.cluster == cluster)
    return used / state.equity_usd


def correlation_weighted_gross(state: RiskState, candidate_notional: float, rho: float) -> float:
    if not state.open_positions:
        return abs(candidate_notional)
    existing = sum(abs(p.notional_usd) for p in state.open_positions)
    return existing + abs(candidate_notional) * math.sqrt(1.0 + max(rho, 0.0))


def stop_and_take(vol_h: float, r_mult: float = TP_R_MULT_DEFAULT) -> tuple[float, float]:
    sl = max(STOP_LOSS_VOL_MULT * vol_h, STOP_LOSS_FLOOR)
    tp = r_mult * sl
    return sl, tp


def _breaker_reasons(state: RiskState) -> list[str]:
    reasons: list[str] = []
    if Path(KILL_SWITCH_FILE).exists():
        reasons.append("kill_switch_file_present")
    if state.equity_at_utc_midnight > 0:
        dd = 1.0 - state.equity_usd / state.equity_at_utc_midnight
        if dd >= 0.12:
            reasons.append(f"daily_drawdown_{dd:.2%}")
    if state.data_uptime_5m < 0.90:
        reasons.append(f"data_uptime_low_{state.data_uptime_5m:.2%}")
    if abs(state.funding_zscore) > 4.0:
        reasons.append(f"funding_shock_z_{state.funding_zscore:.1f}")
    for p in state.open_positions:
        if p.liquidation_distance < 0.20:
            reasons.append(f"liquidation_proximity_{p.symbol}_{p.liquidation_distance:.2%}")
    return reasons


def evaluate(candidate: Candidate, state: RiskState) -> Decision:
    breakers = _breaker_reasons(state)
    if breakers:
        return Decision(accepted=False, reason="; ".join(breakers))

    # Net edge check after realistic costs
    p, b, cost_bps = candidate.p_up_calibrated, candidate.reward_to_risk, candidate.expected_cost_bps
    net_edge_bps = (p * b - (1 - p)) * 10_000 - cost_bps
    if net_edge_bps <= 0:
        return Decision(accepted=False, reason=f"edge_negative_net_{net_edge_bps:.1f}bps")

    f_kelly = full_kelly(p, b)
    if f_kelly <= 0:
        return Decision(accepted=False, reason="kelly_non_positive")

    k = STAGE_KELLY[state.stage]
    if state.consecutive_losses >= 5:
        k *= 0.5  # loss-streak breaker halves kelly

    # Regime veto
    reg_mult = REGIME_LEVERAGE_MULTIPLIER[candidate.regime]
    if reg_mult <= 0:
        return Decision(accepted=False, reason=f"regime_veto_{candidate.regime}")

    # Vol-target scaling
    if candidate.horizon_vol <= 0:
        return Decision(accepted=False, reason="vol_estimate_missing")
    f_raw = k * f_kelly
    f_vol = f_raw * (VOL_TARGET_DAILY / candidate.horizon_vol)

    # Cluster cap
    cluster_used = cluster_used_fraction(state, candidate.cluster)
    cluster_cap = CLUSTER_CAPS.get(candidate.cluster, 0.10)
    cluster_remaining = max(cluster_cap - cluster_used, 0.0)

    # Leverage cap under regime & stage
    lev_cap = STAGE_MAX_LEVERAGE[state.stage] * reg_mult

    # Convert to notional
    max_notional_equity = state.equity_usd * min(f_vol, cluster_remaining)
    max_notional_lev = state.equity_usd * lev_cap
    notional = max(min(max_notional_equity, max_notional_lev), 0.0)

    if notional <= 0:
        return Decision(accepted=False, reason="sized_to_zero_after_caps")

    # Portfolio gross check
    gross = correlation_weighted_gross(state, notional, candidate.correlation_to_open)
    if gross > state.equity_usd * PORTFOLIO_MAX_GROSS:
        allowed = max(state.equity_usd * PORTFOLIO_MAX_GROSS
                      - sum(abs(p.notional_usd) for p in state.open_positions), 0.0)
        allowed_notional = allowed / max(math.sqrt(1.0 + max(candidate.correlation_to_open, 0.0)), 1e-9)
        notional = min(notional, allowed_notional)
        if notional <= 0:
            return Decision(accepted=False, reason="portfolio_gross_saturated")

    sl, tp = stop_and_take(candidate.horizon_vol)
    leverage = min(notional / state.equity_usd, lev_cap)

    return Decision(
        accepted=True,
        notional_usd=notional,
        leverage=leverage,
        stop_loss=sl,
        take_profit=tp,
        reason=f"kelly_f={f_kelly:.3f} k_eff={k:.2f} regime={candidate.regime} lev_cap={lev_cap:.1f}",
    )


def house_money_sweep(equity: float, principal: float, high_water: float, sweep_ratio: float = 0.5) -> float:
    """Return USDC to sweep to cold wallet after crossing house-money threshold."""
    if equity < 3.0 * principal:
        return 0.0
    if equity <= high_water:
        return 0.0
    return (equity - high_water) * sweep_ratio


if __name__ == "__main__":
    demo_state = RiskState(
        equity_usd=100.0,
        stage=Stage.GROW,
        equity_at_utc_midnight=100.0,
    )
    demo_candidate = Candidate(
        symbol="BTC-PERP",
        cluster="btc_beta",
        side="long",
        p_up_calibrated=0.58,
        reward_to_risk=2.5,
        horizon_vol=0.025,
        correlation_to_open=0.0,
        expected_cost_bps=8.0,
        regime=Regime.TREND_UP,
        venue="hyperliquid",
    )
    result = evaluate(demo_candidate, demo_state)
    print(result)
