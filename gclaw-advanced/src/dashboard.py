"""Living dashboard — single-file stdlib HTTP server, no external deps.

Bound to 127.0.0.1:18790 by default. Serves an HTML page and a /state JSON
endpoint that the page polls.
"""

from __future__ import annotations

import json
import math
import statistics
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Callable


@dataclass
class DashboardState:
    equity_usd: float = 0.0
    stage: str = "seed"
    principal_usd: float = 10.0
    equity_curve: list[float] = field(default_factory=list)
    breakers: list[dict] = field(default_factory=list)
    llm_cost_burn_24h_usd: float = 0.0
    open_positions: list[dict] = field(default_factory=list)
    last_regime: dict[str, str] = field(default_factory=dict)

    def sortino(self) -> float:
        if len(self.equity_curve) < 20:
            return 0.0
        rets = [self.equity_curve[i] / self.equity_curve[i - 1] - 1
                for i in range(1, len(self.equity_curve))
                if self.equity_curve[i - 1] > 0]
        if not rets:
            return 0.0
        down = [r for r in rets if r < 0]
        if not down:
            return 0.0
        mean = statistics.fmean(rets)
        dd = math.sqrt(sum(r * r for r in down) / len(down))
        return (mean / (dd or 1e-9)) * math.sqrt(365)

    def honest_days_to(self, target_usd: float) -> str:
        s = self.sortino()
        if s <= 0 or self.equity_usd <= 0:
            return "∞ (edge unproved)"
        # Very rough: assume Sortino corresponds to ~daily geometric return of s/sqrt(365)*avg_vol
        daily = s / math.sqrt(365) * 0.02
        if daily <= 0:
            return "∞ (edge unproved)"
        days = math.log(target_usd / self.equity_usd) / math.log(1 + daily)
        if not math.isfinite(days) or days < 0:
            return "already"
        return f"{days:.0f} days at trailing Sortino"


HTML_PAGE = """<!doctype html>
<meta charset="utf-8">
<title>Gclaw Advanced</title>
<style>
  :root { --bg:#0b0e12; --fg:#e6e6e6; --muted:#8a95a5; --accent:#5cf; --warn:#f80; --bad:#f55; --ok:#6c6; }
  body { background: var(--bg); color: var(--fg); font: 14px ui-monospace, monospace; margin: 0; padding: 24px; }
  h1 { margin: 0 0 16px; font-size: 18px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
  .tile { background: #131922; border: 1px solid #1f2833; border-radius: 8px; padding: 12px; }
  .k { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  .v { font-size: 22px; margin-top: 4px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1a2130; }
  .ok { color: var(--ok); } .warn { color: var(--warn); } .bad { color: var(--bad); }
</style>
<h1>Gclaw Advanced — live</h1>
<div class="grid">
  <div class="tile"><div class="k">Equity</div><div class="v" id="equity">–</div></div>
  <div class="tile"><div class="k">Stage</div><div class="v" id="stage">–</div></div>
  <div class="tile"><div class="k">Sortino (live, trailing)</div><div class="v" id="sortino">–</div></div>
  <div class="tile"><div class="k">Honest days to $5,000</div><div class="v" id="days">–</div></div>
  <div class="tile"><div class="k">LLM burn 24h</div><div class="v" id="llm">–</div></div>
</div>
<h2 style="margin-top:24px; font-size:14px;">Breakers</h2>
<div id="breakers" class="tile"></div>
<h2 style="margin-top:24px; font-size:14px;">Regimes</h2>
<div id="regimes" class="tile"></div>
<script>
async function refresh() {
  const r = await fetch("/state"); const s = await r.json();
  document.getElementById("equity").textContent = "$" + s.equity_usd.toFixed(2);
  document.getElementById("stage").textContent = s.stage;
  document.getElementById("sortino").textContent = s.sortino.toFixed(2);
  document.getElementById("days").textContent = s.days_to_target;
  document.getElementById("llm").textContent = "$" + s.llm_cost_burn_24h_usd.toFixed(2);
  document.getElementById("breakers").innerHTML =
    s.breakers.map(b => `<div class="row"><span>${b.name}</span><span class="${b.state==='tripped'?'bad':(b.state==='cooling'?'warn':'ok')}">${b.state} ${b.reason||''}</span></div>`).join("") || "<div>all armed</div>";
  document.getElementById("regimes").innerHTML =
    Object.entries(s.last_regime).map(([k,v]) => `<div class="row"><span>${k}</span><span>${v}</span></div>`).join("") || "<div>no data</div>";
}
refresh(); setInterval(refresh, 3000);
</script>
"""


def make_handler(get_state: Callable[[], DashboardState]) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        def _send(self, code: int, body: bytes, ctype: str) -> None:
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_: object) -> None:  # silence stdlib chatter
            return

        def do_GET(self) -> None:
            if self.path == "/state":
                s = get_state()
                payload = {
                    "equity_usd": s.equity_usd,
                    "stage": s.stage,
                    "principal_usd": s.principal_usd,
                    "sortino": s.sortino(),
                    "days_to_target": s.honest_days_to(5000),
                    "breakers": s.breakers,
                    "llm_cost_burn_24h_usd": s.llm_cost_burn_24h_usd,
                    "open_positions": s.open_positions,
                    "last_regime": s.last_regime,
                }
                self._send(200, json.dumps(payload).encode(), "application/json")
                return
            if self.path == "/":
                self._send(200, HTML_PAGE.encode(), "text/html; charset=utf-8")
                return
            self._send(404, b"not found", "text/plain")

    return Handler


def serve(get_state: Callable[[], DashboardState], host: str = "127.0.0.1", port: int = 18790) -> None:
    server = HTTPServer((host, port), make_handler(get_state))
    print(f"gclaw dashboard on http://{host}:{port}")
    server.serve_forever()
