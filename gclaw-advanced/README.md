# Gclaw Advanced

An override layer for [GemachDAO/Gclaw](https://github.com/GemachDAO/Gclaw) that
keeps the "autonomous, survive-or-die compounder" spirit but replaces the
static, all-in configuration with a system that **earns** aggression from
realized edge instead of assuming it.

## Why this exists

The straightforward "max out every knob" configuration — 95% position size,
25x leverage, trade through chop, no correlation limits — has one predictable
outcome: a ~4% adverse move liquidates you, and one bad day erases three good
ones. The math doesn't care how bold the prompt is.

This layer replaces the static config with adaptive components that:

1. **Size positions from evidence, not bravado** — fractional Kelly driven by
   the strategy's own rolling edge, capped by regime and portfolio correlation.
2. **Detect regime before trading** — a lightweight vol/trend classifier that
   sits out chop *by default* and only levers up when the tape earns it.
3. **Fuse multiple signals** — copy-trading is one input, not the whole thesis;
   combined with on-chain flow, orderbook imbalance, funding-rate skew, and
   sentiment via a calibrated ensemble.
4. **Enforce portfolio-level risk** — correlation-aware exposure caps, so
   "5 BTC-beta positions" don't count as 5 uncorrelated trades.
5. **Ship a dead-man switch** — hard circuit breakers on drawdown, loss-streak,
   funding, and inference-cost burn. Halts on trip, resumes only on evidence.
6. **Calibrate against reality** — every live decision is shadow-traded in
   paper mode; drift between the two is a first-class metric.
7. **Cost-tier its own brain** — Ollama for routine decisions, larger models
   only when the position-value × decision-uncertainty threshold is crossed.
8. **Backtest properly** — walk-forward with realistic fees, slippage, funding,
   and liquidation math. No look-ahead. Ever.

## Read next

- `docs/ARCHITECTURE.md` — the design in one document
- `docs/RISK_MODEL.md` — the exact position-sizing and circuit-breaker math
- `docs/STAGED_AGGRESSION.md` — how the system scales aggression as it earns it
- `config/config.template.json` — the improved config, annotated
- `src/*.py` — reference implementation of each component
- `scripts/deploy.sh` and `scripts/revert-to-safe.sh` — one-shot operators
