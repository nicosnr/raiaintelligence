"""Market data fabric tests: reconnect, liveness, fanout."""

from __future__ import annotations

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.market_data import MarketDataFabric, Subscription


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro) if False else asyncio.run(coro)


def test_health_window_uptime_scales_with_message_rate():
    async def scenario():
        fabric = MarketDataFabric()

        async def stream(sub: Subscription):
            for i in range(30):
                sub.publish({"i": i})
                await asyncio.sleep(0.01)

        sub = fabric.register("test", stream, expected_msgs_per_second=100.0)
        fabric.start_all()
        # Wait for the stream to actually run — reconnect loop schedules onto the loop
        await asyncio.sleep(0.6)
        u = sub.health.uptime(sub.expected_msgs_per_second)
        # 30 msgs against 100/s expected over 300s window is tiny — expect < 1%
        assert 0 <= u < 0.02
        await fabric.stop_all()

    _run(scenario())


def test_reconnect_after_failure_with_backoff():
    async def scenario():
        attempts = {"n": 0}
        fabric = MarketDataFabric()

        async def stream(sub: Subscription):
            attempts["n"] += 1
            if attempts["n"] < 3:
                raise RuntimeError("simulated_drop")
            for i in range(3):
                sub.publish({"i": i})
                await asyncio.sleep(0.01)

        fabric.register("flaky", stream, expected_msgs_per_second=1.0)
        # Shorten backoff via monkeypatch on the stream instance
        s = fabric.streams["flaky"]
        s.base_backoff = 0.05
        s.max_backoff = 0.2
        fabric.start_all()
        await asyncio.sleep(1.0)
        assert attempts["n"] >= 3, f"expected reconnects, got {attempts['n']}"
        await fabric.stop_all()

    _run(scenario())


def test_fanout_to_multiple_subscribers():
    async def scenario():
        fabric = MarketDataFabric()

        async def stream(sub: Subscription):
            for i in range(5):
                sub.publish({"i": i})
                await asyncio.sleep(0.01)
            await asyncio.sleep(1)  # keep alive

        sub = fabric.register("fanout", stream, expected_msgs_per_second=10.0)
        q1, q2 = sub.subscribe(), sub.subscribe()
        fabric.start_all()
        received1: list[dict] = []
        received2: list[dict] = []
        try:
            for _ in range(5):
                received1.append(await asyncio.wait_for(q1.get(), timeout=1.0))
                received2.append(await asyncio.wait_for(q2.get(), timeout=1.0))
        finally:
            await fabric.stop_all()
        assert [m["i"] for m in received1] == [0, 1, 2, 3, 4]
        assert [m["i"] for m in received2] == [0, 1, 2, 3, 4]

    _run(scenario())


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn(); print(f"ok    {name}")
            except AssertionError as e:
                print(f"FAIL  {name}: {e}")
