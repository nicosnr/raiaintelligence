# Risk Model

The complete math the Risk Engine executes on every candidate trade.

## Notation

- `E`  — current equity in USD
- `p`  — signal fusion probability of favourable move, calibrated
- `b`  — reward-to-risk ratio (take-profit / stop-loss), net of fees
- `σ`  — realized volatility of the traded asset at the trade horizon
- `ρ`  — correlation vector of the candidate vs current open positions
- `L`  — per-regime leverage cap (see Staged Aggression)
- `k`  — kelly_fraction (0.10 – 0.30, staged)

## Position sizing

### Full Kelly (informative only)

```
f_kelly = (b * p - (1 - p)) / b
```

### Fractional Kelly with vol scaling

```
f_raw   = k * f_kelly
f_vol   = f_raw * (σ_target / σ)                     # vol-target scaling
f_final = clip(f_vol, 0, min(equity_cap, cluster_cap, leverage_cap))
```

Where:

- `σ_target` = 0.02 daily (2% target vol per position)
- `equity_cap` = `stage.max_position_fraction * E`
- `cluster_cap` = `remaining budget in the asset's beta cluster`
- `leverage_cap` = `L / (b + 1)` — leverage never exceeds regime cap
  even when Kelly says otherwise

If `f_final <= 0`: **no trade**. Fresh strategies with insufficient trade
history to estimate edge get `p = 0.5` and therefore `f_kelly ≤ 0` — they
paper-trade until they've earned a sizing.

## Portfolio caps

**Cluster budgets** (fraction of equity):

| Cluster       | Cap  | Members (examples)                   |
| ------------- | ---- | ------------------------------------ |
| BTC-beta      | 0.60 | BTC, WBTC, high-beta majors          |
| ETH-beta      | 0.50 | ETH, LSTs, ETH-perp                  |
| SOL-beta      | 0.40 | SOL, SOL-DeFi                        |
| Alt-large     | 0.35 | Top-20 by mcap                       |
| Alt-small     | 0.15 | Anything smaller                     |
| Memes         | 0.05 | Explicit meme tag                    |
| Stables       | 1.00 | Idle capital                         |

New positions in a cluster consume that cluster's budget in proportion to
`notional × sqrt(σ_asset / σ_market)`.

**Correlation-weighted gross notional cap**:

```
gross_effective = sum_i (|notional_i| * sqrt(1 + max(ρ_i,j)))
gross_effective <= E * portfolio_max_gross          # default 3.0
```

**Downside cap** (5% CVaR from bootstrapped strategy returns):

```
CVaR_5 <= 0.15 * E
```

## Circuit breakers

Each breaker is a small state machine with `armed → tripped → cooling → armed`.

| Breaker              | Trip condition                              | Action                             | Cooldown          |
| -------------------- | ------------------------------------------- | ---------------------------------- | ----------------- |
| Daily drawdown       | equity vs UTC-midnight equity < -12%        | flatten all, no new entries        | 12h               |
| Loss streak          | 5 consecutive losing closed trades          | halve `k` for next 20 trades       | until 20 trades   |
| GMAC burn            | 24h GMAC burn > 30% of stack                | LLM tier: Sonnet → Haiku → Ollama  | until burn < 20%  |
| Data liveness        | any subscription < 90% uptime over 5m       | pause new entries                  | until 5m > 99%    |
| Funding shock        | funding rate |z-score| > 4 vs 30d          | flatten that venue's positions     | 4h                |
| Manual kill          | file `/tmp/gclaw.halt` exists               | flat + freeze                      | until file gone   |
| Liquidation proximity| any position within 20% of liquidation      | reduce that position by 50%        | continuous        |

## Leverage table (per regime, per stage)

| Regime        | Seed | Prove | Grow | Scale | Compound |
| ------------- | ---- | ----- | ---- | ----- | -------- |
| TREND_UP      | 3    | 5     | 8    | 12    | 15*      |
| TREND_DOWN    | 3    | 5     | 8    | 12    | 15*      |
| RANGE         | 1    | 2     | 3    | 4     | 5        |
| CHOP          | 0    | 0     | 1    | 1     | 2        |
| VOL_SPIKE     | 0    | 0     | 0    | 2     | 3        |
| DISLOCATED    | arb-only across all stages                             |

*15x cap can extend to 20x only after Sortino > 3.0 over 30 live days.

## Take-profit / stop-loss adaptive bands

Fixed 8% SL / 25% TP is the wrong shape — it ignores volatility. Instead:

```
stop_loss   = max(1.5 * σ_h, 0.03)      # never tighter than 3%
take_profit = b_target * stop_loss       # b_target defaults to 2.5
trailing    = enabled after +1 * σ_h in favour
```

Where `σ_h` is the asset's realized vol at the trade's expected holding
horizon.

## Fee, slippage, funding accounting

Every sizing decision subtracts a **realistic** round-trip cost:

```
cost_bps = taker_fee_bps * 2 + est_slippage_bps + expected_funding_bps
```

If `p * b - (1 - p)` net of `cost_bps` is not positive, the trade is
rejected before it reaches Kelly. This is what kills most copy-trading
setups in practice: the copied signal is fine, but rebroadcast latency +
fees + funding turn it into a slow bleed.
