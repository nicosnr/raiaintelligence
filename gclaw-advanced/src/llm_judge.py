"""LLM Judge — cost-tiered advisory calls with full provenance.

Tiers are picked by (a) fusion certainty, (b) position notional, and
(c) regime transitions. Every call is logged for offline calibration.
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Awaitable, Callable, Protocol


class Tier(str, Enum):
    SANITY = "sanity"           # Ollama local, free
    ROUTINE = "routine"         # Haiku 4.5
    REASONING = "reasoning"     # Sonnet 5
    POST_MORTEM = "post_mortem" # Opus 5, weekly only


TIER_MODEL = {
    Tier.SANITY: "ollama/llama3.1:8b",
    Tier.ROUTINE: "claude-haiku-4-5-20251001",
    Tier.REASONING: "claude-sonnet-5",
    Tier.POST_MORTEM: "claude-opus-5",
}


@dataclass
class JudgeInput:
    fusion_p: float
    fusion_uncertainty: float   # in [0, 1]; center bands escalate tier
    regime_transition: bool
    notional_usd: float


@dataclass
class JudgeCall:
    tier: Tier
    model: str
    prompt_hash: str
    inputs: dict
    output: str
    verdict: str                # "proceed" | "reject" | "resize" | "escalate"
    resize_scale: float | None = None
    ts: float = field(default_factory=time.time)


class ChatClient(Protocol):
    async def complete(self, model: str, prompt: str) -> str: ...


def pick_tier(inp: JudgeInput,
              escalate_notional_usd: float = 500.0,
              uncertainty_band: tuple[float, float] = (0.45, 0.55)) -> Tier:
    if inp.regime_transition:
        return Tier.REASONING
    if inp.notional_usd >= escalate_notional_usd:
        return Tier.REASONING
    if uncertainty_band[0] <= inp.fusion_p <= uncertainty_band[1]:
        return Tier.REASONING
    if inp.notional_usd >= 50:
        return Tier.ROUTINE
    return Tier.SANITY


def _hash_prompt(prompt: str) -> str:
    return hashlib.sha256(prompt.encode()).hexdigest()[:16]


async def judge(client: ChatClient, inp: JudgeInput, prompt: str,
                cost_budget_remaining_usd: float) -> JudgeCall:
    tier = pick_tier(inp)
    # cost-aware downshift
    if cost_budget_remaining_usd < 0.10 and tier != Tier.SANITY:
        tier = Tier.ROUTINE
    if cost_budget_remaining_usd < 0.02:
        tier = Tier.SANITY

    model = TIER_MODEL[tier]
    raw = await client.complete(model, prompt)

    # Parse a strict verdict tag. Never trust free-form text as an action.
    verdict = "reject"
    resize_scale: float | None = None
    tag_start = raw.rfind("<verdict>")
    tag_end = raw.rfind("</verdict>")
    if 0 <= tag_start < tag_end:
        payload = raw[tag_start + len("<verdict>"): tag_end].strip().lower()
        if payload in {"proceed", "reject", "escalate"}:
            verdict = payload
        elif payload.startswith("resize:"):
            try:
                resize_scale = float(payload.split(":", 1)[1])
                verdict = "resize"
            except ValueError:
                pass

    return JudgeCall(
        tier=tier,
        model=model,
        prompt_hash=_hash_prompt(prompt),
        inputs={"fusion_p": inp.fusion_p, "notional_usd": inp.notional_usd,
                "regime_transition": inp.regime_transition},
        output=raw,
        verdict=verdict,
        resize_scale=resize_scale,
    )


PROMPT_TEMPLATE = """You are the second-opinion judge for an autonomous crypto trading agent.
You must respond with a short reasoning followed by a single verdict tag.

Trade candidate:
- symbol: {symbol}
- side: {side}
- fusion probability of favourable move (calibrated): {p:.3f}
- reward-to-risk: {b:.2f}
- proposed notional (USD): {notional:.2f}
- current regime: {regime}
- open positions summary: {open_summary}

Rules:
- Reject if the trade violates any obvious risk rule (single-asset concentration, entering during a
  clear illiquidity or news vacuum, sizing that would trigger any stated cluster cap).
- Resize with a scale in (0, 1] if the trade is directionally right but overpositioned.
- Proceed if nothing about this trade would surprise a disciplined risk manager.
- Escalate only if the situation is materially unusual and warrants human review.

End with exactly one of:
<verdict>proceed</verdict>
<verdict>reject</verdict>
<verdict>resize:0.5</verdict>
<verdict>escalate</verdict>
"""
