"""Property-style tests for the risk engine. Run with: python3 -m pytest tests/"""

from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.risk_engine import (
    Candidate, Position, Regime, RiskState, Stage,
    evaluate, house_money_sweep, full_kelly,
)


def _seed_candidate(**over):
    base = dict(
        symbol="BTC-PERP",
        cluster="btc_beta",
        side="long",
        p_up_calibrated=0.60,
        reward_to_risk=2.0,
        horizon_vol=0.02,
        correlation_to_open=0.0,
        expected_cost_bps=6.0,
        regime=Regime.TREND_UP,
        venue="hyperliquid",
    )
    base.update(over)
    return Candidate(**base)


def _seed_state(**over):
    base = dict(
        equity_usd=10.0,
        stage=Stage.SEED,
        equity_at_utc_midnight=10.0,
    )
    base.update(over)
    return RiskState(**base)


def test_full_kelly_matches_formula():
    assert abs(full_kelly(0.6, 2.0) - ((2.0 * 0.6 - 0.4) / 2.0)) < 1e-9


def test_seed_stage_caps_leverage_at_3x_even_when_kelly_says_more():
    cand = _seed_candidate(p_up_calibrated=0.90, reward_to_risk=5.0, horizon_vol=0.005)
    d = evaluate(cand, _seed_state())
    assert d.accepted
    assert d.leverage <= 3.0 + 1e-9, f"seed stage must cap at 3x, got {d.leverage}"


def test_chop_regime_rejects_or_shrinks_dramatically():
    cand = _seed_candidate(regime=Regime.CHOP, p_up_calibrated=0.65)
    d = evaluate(cand, _seed_state(stage=Stage.GROW))
    # Chop multiplier 0.15 → leverage cap becomes ≤ 8 * 0.15 = 1.2x
    assert not d.accepted or d.leverage <= 1.21


def test_dislocated_regime_never_takes_discretionary():
    cand = _seed_candidate(regime=Regime.DISLOCATED)
    d = evaluate(cand, _seed_state())
    assert not d.accepted
    assert "regime_veto" in d.reason


def test_daily_drawdown_breaker_blocks_new_entries():
    # equity fell from 100 to 85 → 15% dd
    state = _seed_state(equity_usd=85.0, equity_at_utc_midnight=100.0, stage=Stage.SCALE)
    d = evaluate(_seed_candidate(), state)
    assert not d.accepted
    assert "daily_drawdown" in d.reason


def test_kill_switch_file_flattens():
    kill = "/tmp/gclaw.halt"
    open(kill, "w").close()
    try:
        d = evaluate(_seed_candidate(), _seed_state())
        assert not d.accepted
        assert "kill_switch" in d.reason
    finally:
        os.remove(kill)


def test_cluster_cap_binds_before_leverage_cap():
    # Existing large BTC-beta position uses up most of cluster budget
    state = _seed_state(equity_usd=100.0, stage=Stage.SCALE)
    state.open_positions.append(Position(
        symbol="ETH-PERP", cluster="btc_beta", notional_usd=55.0, liquidation_distance=0.5,
    ))
    d = evaluate(_seed_candidate(cluster="btc_beta"), state)
    # cluster cap 0.60, already 0.55 used, remaining budget = 0.05 * equity = $5
    assert not d.accepted or d.notional_usd <= 5.01


def test_negative_edge_after_cost_rejected():
    # tiny edge (~20 bps) crushed by 40 bps of round-trip cost
    cand = _seed_candidate(p_up_calibrated=0.501, reward_to_risk=1.0, expected_cost_bps=40.0)
    d = evaluate(cand, _seed_state(stage=Stage.GROW))
    assert not d.accepted
    assert "edge_negative_net" in d.reason


def test_fractional_kelly_below_full_kelly():
    """The whole point: SEED stage should never bet full Kelly."""
    cand = _seed_candidate(p_up_calibrated=0.65, reward_to_risk=2.5, horizon_vol=0.02)
    d_seed = evaluate(cand, _seed_state(stage=Stage.SEED))
    d_scale = evaluate(cand, _seed_state(stage=Stage.SCALE))
    assert d_seed.accepted and d_scale.accepted
    # seed uses kelly=0.10, scale uses kelly=0.25 → scale notional must be larger
    assert d_scale.notional_usd > d_seed.notional_usd


def test_house_money_activates_after_3x_principal():
    assert house_money_sweep(equity=25, principal=10, high_water=25) == 0
    swept = house_money_sweep(equity=45, principal=10, high_water=30)
    assert swept == 7.5  # (45-30)*0.5
    assert house_money_sweep(equity=35, principal=10, high_water=40) == 0


def test_liquidation_proximity_breaker_on_open_pos():
    state = _seed_state(stage=Stage.SCALE, equity_usd=100.0)
    state.open_positions.append(Position(
        symbol="SOL-PERP", cluster="sol_beta", notional_usd=10.0, liquidation_distance=0.15,
    ))
    d = evaluate(_seed_candidate(), state)
    assert not d.accepted
    assert "liquidation_proximity" in d.reason


if __name__ == "__main__":
    import sys as _sys
    # minimal runner in case pytest isn't installed
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"ok    {t.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL  {t.__name__}: {e}")
    _sys.exit(1 if failed else 0)
