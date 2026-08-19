"""Signal fusion — combine uncorrelated alpha inputs into a calibrated probability.

Each signal source ships a raw score in [0, 1] plus a self-reported
confidence in [0, 1]. Fusion is a log-odds weighted sum with online
isotonic recalibration against realized outcomes.
"""

from __future__ import annotations

import math
from collections import deque
from dataclasses import dataclass, field
from typing import Callable, Deque


@dataclass
class Signal:
    name: str
    raw: float          # in [0, 1]
    confidence: float   # in [0, 1]


@dataclass
class Calibrator:
    """Cheap isotonic-ish calibrator based on rolling bin means."""
    n_bins: int = 20
    history: Deque[tuple[float, int]] = field(default_factory=lambda: deque(maxlen=2000))

    def observe(self, predicted: float, realized: int) -> None:
        self.history.append((predicted, realized))

    def calibrate(self, predicted: float) -> float:
        if len(self.history) < 50:
            return predicted
        # simple bin lookup
        bin_edges = [i / self.n_bins for i in range(self.n_bins + 1)]
        idx = min(int(predicted * self.n_bins), self.n_bins - 1)
        lo, hi = bin_edges[idx], bin_edges[idx + 1]
        bucket = [r for pr, r in self.history if lo <= pr < hi]
        if not bucket:
            return predicted
        emp = sum(bucket) / len(bucket)
        # blend with a prior so single outlier buckets don't dominate
        n = len(bucket)
        return (n * emp + 5 * predicted) / (n + 5)


def _logit(p: float) -> float:
    p = min(max(p, 1e-6), 1 - 1e-6)
    return math.log(p / (1 - p))


def _sigmoid(z: float) -> float:
    if z >= 0:
        e = math.exp(-z)
        return 1 / (1 + e)
    e = math.exp(z)
    return e / (1 + e)


def fuse(signals: list[Signal], calibrator: Calibrator | None = None) -> float:
    """Return calibrated probability of favourable move."""
    if not signals:
        return 0.5
    z = 0.0
    for s in signals:
        w = max(min(s.confidence, 1.0), 0.0)
        z += w * _logit(s.raw)
    raw_p = _sigmoid(z / max(sum(max(min(s.confidence, 1.0), 0.0) for s in signals), 1e-9))
    if calibrator is None:
        return raw_p
    return calibrator.calibrate(raw_p)


# ---- example signal constructors (stubs; wire to real data) ----

def copy_trade_signal(leader_edge: float, leader_confidence: float) -> Signal:
    return Signal("copy_trade", raw=_sigmoid(leader_edge * 4), confidence=leader_confidence)


def orderbook_imbalance_signal(top_bid_size: float, top_ask_size: float) -> Signal:
    total = top_bid_size + top_ask_size
    if total <= 0:
        return Signal("ob_imbalance", 0.5, 0.0)
    imb = (top_bid_size - top_ask_size) / total  # in [-1, 1]
    return Signal("ob_imbalance", raw=(imb + 1) / 2, confidence=min(math.log1p(total) / 10, 1.0))


def funding_skew_signal(current: float, median_30d: float, sd_30d: float) -> Signal:
    if sd_30d <= 0:
        return Signal("funding_skew", 0.5, 0.0)
    z = (current - median_30d) / sd_30d
    # funding skew is mean-reverting: extreme +funding → short bias
    raw = _sigmoid(-z * 0.6)
    return Signal("funding_skew", raw=raw, confidence=min(abs(z) / 3, 1.0))


def onchain_flow_signal(net_exchange_inflow_usd: float, mcap: float) -> Signal:
    if mcap <= 0:
        return Signal("onchain_flow", 0.5, 0.0)
    ratio = net_exchange_inflow_usd / mcap  # positive = distribution, bearish
    raw = _sigmoid(-ratio * 1000)
    return Signal("onchain_flow", raw=raw, confidence=min(abs(ratio) * 100, 1.0))


if __name__ == "__main__":
    sig = [
        copy_trade_signal(0.15, 0.7),
        orderbook_imbalance_signal(120, 80),
        funding_skew_signal(0.0004, 0.0001, 0.0002),
        onchain_flow_signal(-2_000_000, 500_000_000),
    ]
    print("fused =", fuse(sig))
