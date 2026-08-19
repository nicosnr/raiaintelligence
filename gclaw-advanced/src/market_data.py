"""Market data fabric — supervised, fault-tolerant subscriptions.

Every subscription runs behind a supervisor that:
  - reconnects with exponential backoff on drop
  - tracks liveness (a rolling last-message timestamp)
  - fans messages out to any number of subscribers via asyncio queues
  - exposes health that the data-liveness circuit breaker reads

The fabric is transport-agnostic — the concrete WS wiring lives in the
venue adapters (src/venues/*).
"""

from __future__ import annotations

import asyncio
import logging
import random
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Awaitable, Callable, Deque

logger = logging.getLogger("gclaw.mkt")


@dataclass
class HealthWindow:
    """Rolling window of message timestamps for uptime calculations."""
    max_seconds: float = 300.0
    stamps: Deque[float] = field(default_factory=lambda: deque(maxlen=10_000))

    def observe(self) -> None:
        now = time.time()
        self.stamps.append(now)
        # trim old
        while self.stamps and now - self.stamps[0] > self.max_seconds:
            self.stamps.popleft()

    def uptime(self, expected_per_second: float) -> float:
        """Fraction of expected messages actually seen over the window."""
        if not self.stamps:
            return 0.0
        expected = self.max_seconds * expected_per_second
        return min(len(self.stamps) / max(expected, 1.0), 1.0)

    def seconds_since_last(self) -> float:
        return (time.time() - self.stamps[-1]) if self.stamps else float("inf")


@dataclass
class Subscription:
    key: str
    expected_msgs_per_second: float
    health: HealthWindow = field(default_factory=HealthWindow)
    queues: list[asyncio.Queue] = field(default_factory=list)

    def publish(self, msg: dict) -> None:
        self.health.observe()
        for q in self.queues:
            if q.full():
                # drop oldest so live consumers keep up rather than fall behind
                try:
                    q.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            q.put_nowait(msg)

    def subscribe(self, maxsize: int = 1024) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=maxsize)
        self.queues.append(q)
        return q


class SupervisedStream:
    """Runs a connect coroutine with exponential-backoff retries."""

    def __init__(
        self,
        name: str,
        connect_and_stream: Callable[["Subscription"], Awaitable[None]],
        subscription: Subscription,
        base_backoff: float = 1.0,
        max_backoff: float = 60.0,
    ) -> None:
        self.name = name
        self.connect_and_stream = connect_and_stream
        self.subscription = subscription
        self.base_backoff = base_backoff
        self.max_backoff = max_backoff
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()

    async def _run(self) -> None:
        backoff = self.base_backoff
        while not self._stop.is_set():
            try:
                logger.info("stream[%s] connecting", self.name)
                await self.connect_and_stream(self.subscription)
                backoff = self.base_backoff  # reset on clean end
            except asyncio.CancelledError:
                raise
            except Exception as e:
                # jitter to avoid dogpile reconnects across many streams
                delay = min(backoff, self.max_backoff) * (0.75 + random.random() * 0.5)
                logger.warning("stream[%s] failed: %s — retry in %.1fs", self.name, e, delay)
                try:
                    await asyncio.wait_for(self._stop.wait(), timeout=delay)
                except asyncio.TimeoutError:
                    pass
                backoff = min(backoff * 2, self.max_backoff)

    def start(self) -> None:
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run(), name=f"stream:{self.name}")

    async def stop(self) -> None:
        self._stop.set()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except (asyncio.CancelledError, Exception):
                pass


class MarketDataFabric:
    """Registry of supervised streams. One fabric per process."""

    def __init__(self) -> None:
        self.streams: dict[str, SupervisedStream] = {}
        self.subs: dict[str, Subscription] = {}

    def register(
        self,
        key: str,
        connect_and_stream: Callable[[Subscription], Awaitable[None]],
        expected_msgs_per_second: float,
    ) -> Subscription:
        sub = Subscription(key=key, expected_msgs_per_second=expected_msgs_per_second)
        self.subs[key] = sub
        self.streams[key] = SupervisedStream(key, connect_and_stream, sub)
        return sub

    def start_all(self) -> None:
        for s in self.streams.values():
            s.start()

    async def stop_all(self) -> None:
        await asyncio.gather(*(s.stop() for s in self.streams.values()), return_exceptions=True)

    def uptime_5m(self) -> float:
        if not self.subs:
            return 1.0
        return min(s.health.uptime(s.expected_msgs_per_second) for s in self.subs.values())

    def health_summary(self) -> list[dict]:
        return [
            {
                "key": s.key,
                "uptime_5m": round(s.health.uptime(s.expected_msgs_per_second), 3),
                "seconds_since_last": round(s.health.seconds_since_last(), 1),
            }
            for s in self.subs.values()
        ]
