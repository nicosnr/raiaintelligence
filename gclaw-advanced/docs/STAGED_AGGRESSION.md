# Staged Aggression

Aggression is **earned**. Each stage unlocks the next only when the strategy
has proved it survives the last one.

## Rationale

The original prompt's "start at 95% position size, 25x leverage" is the
right *destination* if and only if the strategy has earned it. Starting
there on $10 with no live edge estimate is equivalent to buying a lottery
ticket with 20:1 payout at 200:1 odds.

Instead, we set the destination the same but pace the journey:

## Stage transitions

Stages are **monotonic** — you can drop back to a lower stage on trip, but
only re-promote after a full stage's promotion criteria are re-met.

| Stage      | Enter when | Promote when                                             |
| ---------- | ---------- | -------------------------------------------------------- |
| Seed       | initialised | ≥ 30 trades AND rolling Sortino > 1.5 AND max DD < 15%   |
| Prove      | promoted from Seed | ≥ 50 trades AND Sortino > 2.0 AND max DD < 12% |
| Grow       | promoted from Prove | ≥ 80 trades AND Sortino > 2.5 AND max DD < 10% |
| Scale      | promoted from Grow  | ≥ 120 trades AND Sortino > 3.0 AND max DD < 8% |
| Compound   | promoted from Scale | permanent unless demoted                        |

Any circuit-breaker trip that crosses a stage boundary demotes to the
lower stage for at least 48h.

## Stage-scoped parameters

Full table lives in `docs/RISK_MODEL.md`. Summary:

|            | Seed  | Prove | Grow  | Scale | Compound |
| ---------- | ----- | ----- | ----- | ----- | -------- |
| Kelly frac | 0.10  | 0.15  | 0.20  | 0.25  | 0.30     |
| Max lev    | 3x    | 5x    | 8x    | 12x   | 15x*     |
| Concurrent | 1     | 2     | 3     | 5     | 7        |
| Universe   | BTC/ETH | + SOL | + top-20 | + arb pairs | + curated meme |
| LLM tier   | Ollama | +Haiku | +Haiku | +Sonnet | +Sonnet, weekly Opus |
| Heartbeat  | 15m   | 10m   | 5m    | 3m    | 3m       |

## What the operator sees

The dashboard's "Days to $5,000" figure is computed from the strategy's
own *live* trailing Sortino, not a wish. When a fresh Seed strategy asks
"how long until $5,000?", the honest answer is `∞ until edge is proved`.
The dashboard says exactly that.

## Withdrawals

The original prompt says "no withdrawals until $5,000 is hit." We instead
enforce a **house-money rule**: once equity ≥ 3× principal, half of every
new equity high is swept to a cold wallet the agent cannot touch. This
guarantees that after reaching $30, at least $10 (the original stake) is
permanently out of harm's way — even if the running position blows up.
