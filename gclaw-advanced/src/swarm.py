"""Swarm — spawn diversified children, allocate capital by Thompson sampling,
combine votes with a Sortino-weighted Byzantine-tolerant quorum.
"""

from __future__ import annotations

import math
import random
import statistics
from dataclasses import dataclass, field


@dataclass
class ChildStat:
    child_id: str
    trades: int = 0
    wins: int = 0
    losses: int = 0
    returns: list[float] = field(default_factory=list)

    @property
    def alpha(self) -> float:
        return 1.0 + self.wins

    @property
    def beta(self) -> float:
        return 1.0 + self.losses

    def sortino(self) -> float:
        if len(self.returns) < 5:
            return 0.0
        down = [r for r in self.returns if r < 0]
        if not down:
            return 0.0
        mean = statistics.fmean(self.returns)
        dd = math.sqrt(sum(r * r for r in down) / len(down))
        return (mean / (dd or 1e-9)) * math.sqrt(365)


def thompson_allocate(children: list[ChildStat], total_capital_usd: float,
                      min_share: float = 0.02) -> dict[str, float]:
    """Sample from each child's Beta(alpha, beta) posterior and split capital."""
    samples = {c.child_id: random.betavariate(c.alpha, c.beta) for c in children}
    # floor
    floored = {k: max(v, min_share) for k, v in samples.items()}
    total = sum(floored.values())
    return {k: total_capital_usd * v / total for k, v in floored.items()}


def sortino_weighted_quorum(votes: dict[str, str], children: dict[str, ChildStat],
                            byzantine_fraction: float = 0.33) -> str | None:
    """Combine child votes ("long"|"short"|"flat") weighted by Sortino.

    A vote wins only if it exceeds (1 - byzantine_fraction) of the weighted
    total — otherwise the swarm passes. This gives byzantine tolerance without
    a full BFT protocol; a lone rogue child cannot move the outcome.
    """
    if not votes:
        return None
    weights: dict[str, float] = {"long": 0.0, "short": 0.0, "flat": 0.0}
    total_w = 0.0
    for cid, vote in votes.items():
        c = children.get(cid)
        if not c:
            continue
        w = max(c.sortino(), 0.1)
        weights[vote] += w
        total_w += w
    if total_w <= 0:
        return None
    threshold = total_w * (1.0 - byzantine_fraction)
    winner, share = max(weights.items(), key=lambda kv: kv[1])
    return winner if share >= threshold else None


SPAWN_THRESHOLDS_USD = [100, 500, 1000, 2500]


def target_child_count(equity_usd: float) -> int:
    n = 0
    for t in SPAWN_THRESHOLDS_USD:
        if equity_usd >= t:
            n += 1
    return n
