"""Walk-forward backtest engine with realistic frictions.

Ships fills against a supplied bar/tick stream, applying fees, slippage,
funding accrual, and liquidation math. The engine is deliberately dumb —
edge lives in the strategy, not in the simulator.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Iterable


@dataclass
class Bar:
    ts: int
    open: float
    high: float
    low: float
    close: float
    volume: float
    funding_rate: float = 0.0


@dataclass
class Position:
    symbol: str
    side: str          # "long" | "short"
    notional_usd: float
    entry_px: float
    leverage: float
    stop_loss: float
    take_profit: float

    def unrealized_pnl(self, px: float) -> float:
        direction = 1 if self.side == "long" else -1
        return (px / self.entry_px - 1.0) * direction * self.notional_usd

    def liquidation_px(self, maintenance_margin: float = 0.005) -> float:
        buffer = 1.0 / self.leverage - maintenance_margin
        if self.side == "long":
            return self.entry_px * (1 - buffer)
        return self.entry_px * (1 + buffer)


@dataclass
class BacktestConfig:
    taker_fee_bps: float = 4.0
    maker_fee_bps: float = 1.0
    est_slippage_bps: float = 3.0
    funding_scale: float = 1.0
    starting_equity_usd: float = 10.0


@dataclass
class Report:
    equity_curve: list[float] = field(default_factory=list)
    trades: list[dict] = field(default_factory=list)

    def summary(self) -> dict:
        if not self.equity_curve:
            return {"trades": 0, "final_equity": 0, "sortino": 0, "max_dd": 0}
        peak = self.equity_curve[0]
        max_dd = 0.0
        for v in self.equity_curve:
            peak = max(peak, v)
            if peak > 0:
                max_dd = max(max_dd, (peak - v) / peak)
        rets = [self.equity_curve[i] / self.equity_curve[i - 1] - 1
                for i in range(1, len(self.equity_curve))]
        downside = [r for r in rets if r < 0]
        if not downside or len(rets) < 2:
            sortino = 0.0
        else:
            mean = sum(rets) / len(rets)
            dd_std = math.sqrt(sum(r * r for r in downside) / len(downside))
            sortino = (mean / (dd_std or 1e-9)) * math.sqrt(365)
        return {
            "trades": len(self.trades),
            "final_equity": self.equity_curve[-1],
            "sortino": round(sortino, 3),
            "max_dd": round(max_dd, 4),
        }


Strategy = Callable[[Bar, "BacktestState"], list[dict]]


@dataclass
class BacktestState:
    cfg: BacktestConfig
    equity: float
    open_positions: list[Position] = field(default_factory=list)
    report: Report = field(default_factory=Report)


def _apply_funding(state: BacktestState, bar: Bar) -> None:
    for p in state.open_positions:
        direction = 1 if p.side == "long" else -1
        # long pays positive funding, short receives
        state.equity -= p.notional_usd * bar.funding_rate * direction * state.cfg.funding_scale


def _close(state: BacktestState, p: Position, px: float, reason: str, bar: Bar) -> None:
    pnl = p.unrealized_pnl(px)
    fees = p.notional_usd * (state.cfg.taker_fee_bps + state.cfg.est_slippage_bps) / 10_000
    state.equity += pnl - fees
    state.report.trades.append({
        "symbol": p.symbol, "side": p.side, "entry_px": p.entry_px, "exit_px": px,
        "pnl": pnl - fees, "reason": reason, "ts": bar.ts,
    })


def _check_stops_and_liq(state: BacktestState, bar: Bar) -> None:
    survivors: list[Position] = []
    for p in state.open_positions:
        liq = p.liquidation_px()
        if p.side == "long":
            if bar.low <= liq:
                _close(state, p, liq, "liquidation", bar)
                continue
            if bar.low <= p.entry_px * (1 - p.stop_loss):
                _close(state, p, p.entry_px * (1 - p.stop_loss), "stop", bar); continue
            if bar.high >= p.entry_px * (1 + p.take_profit):
                _close(state, p, p.entry_px * (1 + p.take_profit), "tp", bar); continue
        else:
            if bar.high >= liq:
                _close(state, p, liq, "liquidation", bar)
                continue
            if bar.high >= p.entry_px * (1 + p.stop_loss):
                _close(state, p, p.entry_px * (1 + p.stop_loss), "stop", bar); continue
            if bar.low <= p.entry_px * (1 - p.take_profit):
                _close(state, p, p.entry_px * (1 - p.take_profit), "tp", bar); continue
        survivors.append(p)
    state.open_positions = survivors


def run(bars: Iterable[Bar], strategy: Strategy, cfg: BacktestConfig | None = None) -> Report:
    cfg = cfg or BacktestConfig()
    state = BacktestState(cfg=cfg, equity=cfg.starting_equity_usd)
    for bar in bars:
        _apply_funding(state, bar)
        _check_stops_and_liq(state, bar)
        intents = strategy(bar, state)
        for i in intents:
            fee = i["notional"] * (cfg.taker_fee_bps + cfg.est_slippage_bps) / 10_000
            state.equity -= fee
            state.open_positions.append(Position(
                symbol=i["symbol"], side=i["side"],
                notional_usd=i["notional"], entry_px=bar.close,
                leverage=i.get("leverage", 1.0),
                stop_loss=i["stop_loss"], take_profit=i["take_profit"],
            ))
        equity_mtm = state.equity + sum(p.unrealized_pnl(bar.close) for p in state.open_positions)
        state.report.equity_curve.append(equity_mtm)
        if equity_mtm <= 0:
            break  # blown up
    return state.report
