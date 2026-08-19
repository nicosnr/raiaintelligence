"""Strategy tests — each strategy is a pure function of context."""

from __future__ import annotations

import sys
import time
from collections import deque
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.strategies import StrategyContext
from src.strategies.copy_trade import CopyTrade, LeaderSnapshot
from src.strategies.funding_meanrev import FundingMeanRev
from src.strategies.basis import CrossVenueBasis
from src.strategies.ob_imbalance import OrderbookImbalance
from src.venues.hyperliquid import Snapshot


def _ctx(**over):
    base = dict(
        equity_usd=100.0,
        stage="grow",
        now_ts=time.time(),
        snapshots={},
        funding_history={},
        bar_series={},
        copy_leaders=[],
        cross_venue_mid={},
    )
    base.update(over)
    return StrategyContext(**base)


def test_copy_trade_filters_low_sortino_leaders():
    good = LeaderSnapshot(
        address="0xgood", track_days=90, sortino_60d=3.0,
        max_drawdown_60d=0.10, trades_60d=100, last10_lose_streak=1,
        positions={"BTC": 5000.0}, confidence=0.9,
    )
    bad = LeaderSnapshot(
        address="0xbad", track_days=90, sortino_60d=0.3,
        max_drawdown_60d=0.40, trades_60d=100, last10_lose_streak=6,
        positions={"BTC": -5000.0}, confidence=0.9,
    )
    ctx = _ctx(
        copy_leaders=[good, bad],
        snapshots={"BTC": Snapshot(bid=60000, bid_sz=2, ask=60010, ask_sz=2)},
    )
    cands = CopyTrade().propose(ctx)
    assert len(cands) == 1
    assert cands[0].side == "long"
    assert cands[0].symbol == "BTC-PERP"


def test_funding_meanrev_shorts_when_funding_z_positive():
    import random
    random.seed(0)
    mid_hour = 1_700_001_500  # deterministic mid-of-hour ts
    # Baseline funding with real variance so pstdev is well-defined;
    # last value 2.5σ above the median → strategy should short.
    base = [random.gauss(0.0001, 0.00005) for _ in range(47)]
    hist = deque(base + [0.0001 + 2.5 * 0.00005])
    ctx = _ctx(
        now_ts=mid_hour,
        funding_history={"ETH": hist},
        snapshots={"ETH": Snapshot(bid=3000, bid_sz=5, ask=3001, ask_sz=5)},
    )
    cands = FundingMeanRev(z_threshold=1.5).propose(ctx)
    assert cands, "expected a candidate when funding z is moderately extreme"
    assert cands[0].side == "short"


def test_funding_meanrev_hushes_around_top_of_hour():
    now = int(time.time())
    top_of_hour = now - (now % 3600) + 10
    hist = deque([0.0001] * 47 + [0.001])
    ctx = _ctx(
        now_ts=top_of_hour,
        funding_history={"ETH": hist},
        snapshots={"ETH": Snapshot(bid=3000, bid_sz=5, ask=3001, ask_sz=5)},
    )
    assert FundingMeanRev().propose(ctx) == []


def test_basis_arb_produces_paired_legs_when_edge_over_cost():
    ctx = _ctx(cross_venue_mid={"SOL": {"hyperliquid": 100.0, "aster": 100.4}})
    cands = CrossVenueBasis(min_bps_edge_after_cost=10.0).propose(ctx)
    # 40 bps spread - 12 bps cost = 28 bps net > 10 threshold → take it
    assert len(cands) == 2
    sides = {c.side for c in cands}
    venues = {c.venue for c in cands}
    assert sides == {"long", "short"}
    assert venues == {"hyperliquid", "aster"}


def test_basis_arb_rejects_when_spread_below_cost():
    ctx = _ctx(cross_venue_mid={"SOL": {"hyperliquid": 100.0, "aster": 100.05}})
    assert CrossVenueBasis().propose(ctx) == []


def test_orderbook_imbalance_requires_depth():
    thin = Snapshot(bid=100, bid_sz=1, ask=100.1, ask_sz=0.1)   # $100 depth
    deep = Snapshot(bid=100, bid_sz=100, ask=100.1, ask_sz=20)  # $12k depth
    ctx = _ctx(snapshots={"THIN": thin, "DEEP": deep})
    cands = OrderbookImbalance(min_top_depth_usd=5_000).propose(ctx)
    assert len(cands) == 1
    assert cands[0].symbol == "DEEP-PERP"
    assert cands[0].side == "long"


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn(); print(f"ok    {name}")
            except AssertionError as e:
                print(f"FAIL  {name}: {e}")
