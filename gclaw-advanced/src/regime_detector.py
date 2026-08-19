"""Regime detector — classify each asset into one of six regimes per bar.

Pure-python, no external deps. In production, swap the internals for a
proper HMM (hmmlearn) or a small torch model — the interface stays the same.
"""

from __future__ import annotations

import math
import statistics
from collections import deque
from dataclasses import dataclass, field
from typing import Deque

from src.risk_engine import Regime


@dataclass
class BarSeries:
    closes: Deque[float] = field(default_factory=lambda: deque(maxlen=288))   # 24h @ 5m
    volumes: Deque[float] = field(default_factory=lambda: deque(maxlen=288))
    funding: Deque[float] = field(default_factory=lambda: deque(maxlen=48))   # 24h @ 30m

    def push(self, close: float, volume: float, funding: float | None = None) -> None:
        self.closes.append(close)
        self.volumes.append(volume)
        if funding is not None:
            self.funding.append(funding)

    def log_returns(self) -> list[float]:
        c = list(self.closes)
        return [math.log(c[i] / c[i - 1]) for i in range(1, len(c)) if c[i - 1] > 0]


def _realized_vol(returns: list[float]) -> float:
    if len(returns) < 8:
        return 0.0
    return statistics.pstdev(returns) * math.sqrt(288)  # annualize from 5m bars is unnecessary here; per-day scaling


def _trend_strength(returns: list[float]) -> float:
    """Simple absolute-mean / stddev ratio, robust to sample size."""
    if len(returns) < 12:
        return 0.0
    mean = statistics.fmean(returns)
    sd = statistics.pstdev(returns) or 1e-9
    return abs(mean) / sd


def _autocorr(returns: list[float], lag: int = 1) -> float:
    if len(returns) < lag + 8:
        return 0.0
    x = returns
    m = statistics.fmean(x)
    num = sum((x[i] - m) * (x[i - lag] - m) for i in range(lag, len(x)))
    den = sum((v - m) ** 2 for v in x) or 1e-9
    return num / den


def _funding_shock_z(funding: list[float]) -> float:
    if len(funding) < 12:
        return 0.0
    m = statistics.fmean(funding)
    sd = statistics.pstdev(funding) or 1e-9
    return (funding[-1] - m) / sd


def classify(series: BarSeries, dislocated_hint: bool = False) -> Regime:
    """Return the current regime for a single asset."""
    returns = series.log_returns()
    if len(returns) < 24:
        # too little history — refuse to trade rather than mislabel
        return Regime.CHOP

    if dislocated_hint:
        return Regime.DISLOCATED

    vol = _realized_vol(returns[-96:])           # last ~8h
    vol_baseline = _realized_vol(returns[:-96]) if len(returns) > 96 else vol
    vol_ratio = vol / max(vol_baseline, 1e-9)

    trend = _trend_strength(returns[-48:])       # last ~4h
    ac1 = _autocorr(returns[-96:])               # persistence
    mean_ret = statistics.fmean(returns[-48:])

    funding_z = _funding_shock_z(list(series.funding))

    if vol_ratio > 2.5 or abs(funding_z) > 3.0:
        return Regime.VOL_SPIKE

    if trend > 0.35 and ac1 > 0.05:
        return Regime.TREND_UP if mean_ret > 0 else Regime.TREND_DOWN

    if trend < 0.15 and abs(ac1) < 0.03:
        return Regime.CHOP

    return Regime.RANGE


if __name__ == "__main__":
    import random
    s = BarSeries()
    price = 100.0
    for _ in range(200):
        price *= math.exp(random.gauss(0.0005, 0.01))
        s.push(price, random.random() * 1000, random.gauss(0.0, 0.0001))
    print(classify(s))
