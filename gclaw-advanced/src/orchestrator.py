"""Orchestrator — the main heartbeat loop that ties every component together.

This is the "brain stem" of Gclaw Advanced. Every heartbeat:
  1. Refresh market data & regime per asset
  2. Ask signal fusion for a probability per candidate
  3. Ask risk engine to size (or reject)
  4. Optionally ask LLM judge for a second opinion
  5. Execute (with paper shadow) if all layers agree
  6. Update ledger + reflect
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass
from pathlib import Path

from src.circuit_breakers import default_board
from src.regime_detector import BarSeries, classify
from src.risk_engine import (
    Candidate, Position, RiskState, Stage, evaluate, house_money_sweep,
)
from src.signal_fusion import Calibrator, fuse

logger = logging.getLogger("gclaw.orch")


@dataclass
class OrchestratorConfig:
    heartbeat_seconds: int = 300
    principal_usd: float = 10.0
    paper_only_first_hours: int = 24
    manual_arm_required: bool = True


@dataclass
class Universe:
    symbols: list[str]
    clusters: dict[str, str]         # symbol -> cluster
    venues: dict[str, list[str]]     # symbol -> venues


class Orchestrator:
    def __init__(self, cfg: OrchestratorConfig, universe: Universe):
        self.cfg = cfg
        self.universe = universe
        self.state = RiskState(equity_usd=cfg.principal_usd, stage=Stage.SEED,
                               equity_at_utc_midnight=cfg.principal_usd)
        self.high_water = cfg.principal_usd
        self.series: dict[str, BarSeries] = {s: BarSeries() for s in universe.symbols}
        self.calibrators: dict[str, Calibrator] = {s: Calibrator() for s in universe.symbols}
        self.breakers = default_board()
        self.started = time.time()
        self.armed_for_live = False

    def paper_gate_active(self) -> bool:
        if self.cfg.manual_arm_required and not self.armed_for_live:
            return True
        elapsed_h = (time.time() - self.started) / 3600
        return elapsed_h < self.cfg.paper_only_first_hours

    async def refresh_bar(self, symbol: str) -> None:
        """Placeholder: in prod, pull last 5m bar from market data fabric."""
        # left for real integration
        pass

    async def gather_candidates(self, symbol: str) -> list[Candidate]:
        """Placeholder: strategies emit Candidate objects here."""
        return []

    async def heartbeat(self) -> None:
        self.breakers.tick()

        # 1. refresh + regime per asset
        for symbol in self.universe.symbols:
            await self.refresh_bar(symbol)

        # 2..5. per asset
        decisions: list[tuple[Candidate, object]] = []
        for symbol in self.universe.symbols:
            regime = classify(self.series[symbol])
            for cand in await self.gather_candidates(symbol):
                cand.regime = regime
                decision = evaluate(cand, self.state)
                decisions.append((cand, decision))
                if not decision.accepted:
                    logger.info("reject %s %s: %s", symbol, cand.side, decision.reason)
                    continue
                if self.paper_gate_active():
                    logger.info("paper %s %s notional=%.2f lev=%.2f",
                                symbol, cand.side, decision.notional_usd, decision.leverage)
                    continue
                # live execution wired here
                logger.info("live  %s %s notional=%.2f lev=%.2f sl=%.3f tp=%.3f",
                            symbol, cand.side, decision.notional_usd, decision.leverage,
                            decision.stop_loss, decision.take_profit)

        # 6. house-money sweep
        sweep = house_money_sweep(self.state.equity_usd, self.cfg.principal_usd, self.high_water)
        if sweep > 0:
            logger.info("sweep %.2f USDC to cold wallet", sweep)
            self.state.equity_usd -= sweep
        self.high_water = max(self.high_water, self.state.equity_usd)

    async def run_forever(self) -> None:
        while True:
            try:
                await self.heartbeat()
            except Exception as e:
                logger.exception("heartbeat_failed: %s", e)
            await asyncio.sleep(self.cfg.heartbeat_seconds)


def load_config(path: str | Path) -> dict:
    return json.loads(Path(path).read_text())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(levelname)s %(name)s %(message)s")
    cfg = OrchestratorConfig()
    uni = Universe(
        symbols=["BTC-PERP", "ETH-PERP"],
        clusters={"BTC-PERP": "btc_beta", "ETH-PERP": "eth_beta"},
        venues={"BTC-PERP": ["hyperliquid"], "ETH-PERP": ["hyperliquid"]},
    )
    orch = Orchestrator(cfg, uni)
    asyncio.run(orch.run_forever())
