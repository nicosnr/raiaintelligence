"""Circuit breakers — small state machines that flatten or throttle the agent.

Every breaker has one of four states:
  armed → tripped → cooling → armed
Only the tripped state affects trading decisions; cooling is a rate-limit
that prevents flap.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum


class BreakerState(str, Enum):
    ARMED = "armed"
    TRIPPED = "tripped"
    COOLING = "cooling"


@dataclass
class Breaker:
    name: str
    cooldown_seconds: float
    state: BreakerState = BreakerState.ARMED
    tripped_at: float = 0.0
    last_reason: str = ""

    def trip(self, reason: str) -> None:
        if self.state is BreakerState.TRIPPED:
            return
        self.state = BreakerState.TRIPPED
        self.tripped_at = time.time()
        self.last_reason = reason

    def tick(self) -> None:
        if self.state is BreakerState.TRIPPED:
            if time.time() - self.tripped_at > self.cooldown_seconds:
                self.state = BreakerState.COOLING
        elif self.state is BreakerState.COOLING:
            # cooling → armed once the operator observes it via a health event
            # In production, wire this to a "healthy for N seconds" observer.
            self.state = BreakerState.ARMED

    def blocking(self) -> bool:
        return self.state is BreakerState.TRIPPED


@dataclass
class BreakerBoard:
    breakers: dict[str, Breaker] = field(default_factory=dict)

    def register(self, breaker: Breaker) -> None:
        self.breakers[breaker.name] = breaker

    def any_blocking(self) -> list[str]:
        return [b.name + ":" + b.last_reason for b in self.breakers.values() if b.blocking()]

    def tick(self) -> None:
        for b in self.breakers.values():
            b.tick()

    def summary(self) -> list[dict]:
        return [
            {"name": b.name, "state": b.state, "reason": b.last_reason,
             "cooldown_remaining_s": max(b.cooldown_seconds - (time.time() - b.tripped_at), 0.0)
             if b.state is BreakerState.TRIPPED else 0.0}
            for b in self.breakers.values()
        ]


def default_board() -> BreakerBoard:
    b = BreakerBoard()
    b.register(Breaker("daily_drawdown", cooldown_seconds=12 * 3600))
    b.register(Breaker("loss_streak", cooldown_seconds=3600))
    b.register(Breaker("gmac_burn", cooldown_seconds=3600))
    b.register(Breaker("data_liveness", cooldown_seconds=300))
    b.register(Breaker("funding_shock", cooldown_seconds=4 * 3600))
    b.register(Breaker("liquidation_proximity", cooldown_seconds=60))
    b.register(Breaker("kill_switch", cooldown_seconds=60))
    return b
