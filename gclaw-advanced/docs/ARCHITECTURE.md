# Gclaw Advanced — Architecture

## Design goal

Build an autonomous trading agent that has a **realistic** chance of
compounding $10 into a materially larger number over 90 days, without
requiring a single mispricing to survive a single tick.

The original "$10 → $5,000 in 90 days" target requires ~7.1% daily compounded
return. That is roughly 50x what elite discretionary traders achieve. It is
a lottery ticket, not a strategy. This system is designed so that:

- **If the market gives you the trade**, it takes it at the right size
  and rides it with the right leverage.
- **If the market doesn't**, it sits still. Capital preservation is the
  primary strategy; alpha is the tie-breaker.
- **If a rare fat tail hits**, a dead-man switch flattens exposure before
  the account is materially impaired.

Aggression is *staged and earned*, not front-loaded and prayed for.

---

## System diagram

```
                   ┌────────────────────────────────┐
                   │        Market Data Fabric      │
                   │  (perp OB, spot OB, funding,   │
                   │   on-chain flow, news, social) │
                   └──────────────┬─────────────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │                   │                    │
     ┌────────▼─────┐   ┌─────────▼────────┐   ┌───────▼────────┐
     │ Regime       │   │  Signal Fusion   │   │  Copy-Trading   │
     │ Detector     │   │  (ensemble of    │   │  Mirror (top    │
     │ (trend/chop/ │   │   uncorrelated   │   │  N HL traders   │
     │  vol-of-vol) │   │   alpha inputs)  │   │  with filters)  │
     └──────┬───────┘   └────────┬─────────┘   └───────┬─────────┘
            │                    │                     │
            └──────────┬─────────┴─────────────────────┘
                       │
                ┌──────▼────────┐
                │  Trade Idea   │ ← LLM Judge (cost-tiered, provenance)
                │  Generator    │
                └──────┬────────┘
                       │
        ┌──────────────▼──────────────┐
        │  Risk Engine                │
        │  • fractional Kelly sizing  │
        │  • correlation-aware caps   │
        │  • per-regime leverage cap  │
        │  • circuit-breaker state    │
        └──────────────┬──────────────┘
                       │
                ┌──────▼───────┐
                │  Execution   │  → smart routing, TWAP, MEV protect
                │  Layer       │  → paper shadow of every live order
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │  Ledger &    │  ← immutable event log, replayable
                │  Reflector   │  → updates strategy priors online
                └──────┬───────┘
                       │
                ┌──────▼────────┐
                │  Living Dash  │  http://127.0.0.1:18790
                └───────────────┘
```

---

## Component-by-component

### 1. Market Data Fabric (`src/market_data.py`)

Uniform, cache-friendly, fault-tolerant access to:

- **Perp orderbook & trades** via HyperLiquid WS
- **Spot orderbook** across CEXes for the traded universe
- **Funding rates** (current + realized 24h) across venues
- **On-chain flow** — DEX trades, large wallet movements, bridge flows
- **Social/news** — filtered X firehose (Kaito API or self-hosted)
- **CEX–DEX basis** — the free-money detector

Every subscription runs behind a supervisor with exponential backoff and a
liveness heartbeat that feeds the health circuit breaker.

### 2. Regime Detector (`src/regime_detector.py`)

A small ensemble that outputs one of `{TREND_UP, TREND_DOWN, RANGE, CHOP,
VOL_SPIKE, DISLOCATED}` per asset per 5-minute bar:

- Log-return autocorrelation over rolling windows
- Realized-vol vs implied-vol spread
- Trend-strength (ADX-like) on higher timeframes
- Volume-profile skew
- Funding-rate acceleration

Regime is a **veto layer** before sizing: `CHOP` caps leverage at 1x and
position size at 20% of Kelly; `DISLOCATED` disables discretionary trading
and hands the tape to the arbitrage strategy only.

The original prompt's directive to "override sit-out-the-chop logic" is
exactly the mistake this component exists to prevent.

### 3. Signal Fusion (`src/signal_fusion.py`)

An online-Bayesian ensemble of *uncorrelated* alpha inputs:

- Copy-trading mirror (filtered by trader's rolling Sortino, not gross PnL)
- Orderbook imbalance (top-of-book pressure + hidden liquidity estimate)
- Funding-rate mean-reversion (skew above/below venue median)
- On-chain accumulation / distribution
- Cross-venue basis
- (Optional) sentiment vector from an LLM over a filtered social feed

Each signal ships a **calibrated probability** (isotonic regression against
its own history), not a confidence score. Ensemble output is a probability
of `up-move > threshold` over a configurable horizon.

### 4. LLM Judge (`src/llm_judge.py`)

Called only when signal-fusion certainty is in the ambiguous band or when
position size × downside crosses a spend threshold. Cost-tiered:

- **Ollama (local, Llama-3.1-8B)** — every candidate idea for a "does this
  even make sense?" gate. Sub-cent per call.
- **Haiku 4.5** — routine trade justification & size sanity.
- **Sonnet 5** — regime transitions, unusual macro conditions, post-mortem.
- **Opus 5** — only for weekly meta-review, not intraday.

Every LLM call is logged with prompt hash, inputs, output, and the
downstream trade it justified. This becomes a training set for the online
calibration loop.

### 5. Risk Engine (`src/risk_engine.py`)

The most important component. Three layers:

**Layer A — Position sizing (fractional Kelly)**
```
f* = (edge / variance)         # full Kelly
f  = kelly_fraction * f*       # 0.25 by default
```
Edge is estimated from the strategy's own last N=200 trades, not from
backtest. Fresh strategies start at f = 0.

**Layer B — Portfolio caps**
- Sum of correlation-weighted notional ≤ portfolio_max_gross
- Per-cluster (BTC-beta / ETH-beta / SOL-beta / stables) exposure limits
- Total downside-at-risk (5% CVaR from bootstrapped returns) ≤ equity × 0.15

**Layer C — Circuit breakers**
- Daily drawdown > 12% → flatten, cool down 12h
- 5 consecutive losing trades → sizing halved for next 20 trades
- Rolling 24h GMAC burn > 30% of stack → downshift LLM tier
- Data-fabric liveness < 90% over 5 min → pause new entries
- Manual killswitch file `/tmp/gclaw.halt` → instant flat

### 6. Execution Layer (`src/execution.py`)

- Smart order routing across HL / Aster / dYdX by expected slippage + fees
- TWAP for sizes > 5% of top-of-book depth
- MEV protection via Flashbots-style private mempool on EVM chains
- Every live order has a **paper shadow order** placed in the paper venue at
  the same tick; end-of-day drift becomes a calibration input

### 7. Backtest Engine (`src/backtest.py`)

Walk-forward-only. No look-ahead. Includes:

- Tick-level fill simulation using top-of-book depth
- Funding accrual per venue
- Liquidation math (initial + maintenance margin per venue)
- Realistic gas/fees per chain
- Rebate accounting for maker fills

Every strategy change **must** pass a walk-forward test on 90 days of held-out
data before promotion.

### 8. Swarm (`src/swarm.py`)

When equity crosses thresholds, spawn children as isolated processes with:

- Independent config mutations (leverage cap, universe, regime thresholds)
- **Weighted quorum** (not majority vote) — each child's weight is its
  rolling Sortino over the last 100 trades, min-clamped so no child can be
  starved silently
- Byzantine-tolerant: 1/3 children can go rogue without moving quorum
- Parent controls capital allocation via a bandit (Thompson sampling) —
  bad children are starved, good children compound

### 9. Ledger & Reflector (`src/ledger.py`)

- Append-only event log (SQLite WAL, cheap and fast)
- Every state transition emits an event; the entire agent is replayable
- Nightly reflector job: recompute the calibration curves, update priors,
  re-fit the regime detector's rolling params, prune degenerate strategies

### 10. Living Dashboard (`src/dashboard.py`)

A single-page dashboard at `http://127.0.0.1:18790`:

- Equity curve + drawdown + Sortino trailing
- Per-strategy PnL attribution
- Live regime per traded asset
- Circuit-breaker state and last-trip history
- LLM cost burn, tier mix, and cache hit rate
- "Days to $5,000 at current trailing Sortino" — the *honest* countdown

---

## Staged aggression policy

Instead of "95% per trade from day one", aggression is unlocked by earned
edge:

| Stage | Equity | Kelly fraction | Max leverage | Concurrent positions |
| ----- | ------ | -------------- | ------------ | -------------------- |
| Seed  | < $25  | 0.10           | 3x           | 1                    |
| Prove | $25 – $100 | 0.15       | 5x           | 2                    |
| Grow  | $100 – $500 | 0.20      | 8x           | 3                    |
| Scale | $500 – $2000 | 0.25     | 12x          | 5                    |
| Compound | > $2000 | 0.30        | 15x*         | 7                    |

*Leverage over 15x is only unlocked after the strategy has demonstrated a
Sortino > 3.0 over 30 rolling days of live trading. Otherwise 15x is the cap.

The full policy lives in `docs/STAGED_AGGRESSION.md`.

---

## Non-goals

- **Guaranteeing $5,000 in 90 days.** No system honest with the math can.
  What this system can do is turn $10 into $10 with 95% probability, or into
  a materially larger number with the remainder, and never lie about which
  timeline you're on.
- **Beating a well-run market-maker at their game.** The system trades
  *away* from HFT edge, not into it.
- **Trading for the sake of trading.** Zero-trade days are a valid outcome.

---

## Failure modes we accept

- Missing a fast trend because regime detection lagged one bar.
- Slower than a static max-agg config on the rare day it wins.
- Higher operational complexity than a two-file config override.

## Failure modes we refuse

- Liquidation from a 4% adverse move.
- Silent overfitting to backtest.
- Killing the account before the operator sees the dashboard.
