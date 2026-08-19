"""Pluggable strategies. Each strategy exports a `propose(state) -> list[Candidate]`.

Strategies are pure functions: they take a snapshot of the world and
return zero or more Candidate trade ideas. The orchestrator applies the
risk engine to every proposal before anything reaches the wire.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from src.risk_engine import Candidate


@dataclass
class StrategyContext:
    """A minimal, read-only view of the world passed to every strategy."""
    equity_usd: float
    stage: str
    now_ts: float
    snapshots: dict = field(default_factory=dict)      # coin -> Snapshot
    funding_history: dict = field(default_factory=dict)  # coin -> deque[float]
    bar_series: dict = field(default_factory=dict)      # coin -> BarSeries
    copy_leaders: list = field(default_factory=list)    # list[LeaderSnapshot]
    cross_venue_mid: dict = field(default_factory=dict) # coin -> {venue: mid}


class Strategy(Protocol):
    name: str
    def propose(self, ctx: StrategyContext) -> list[Candidate]: ...
