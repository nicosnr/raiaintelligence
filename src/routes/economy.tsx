import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight, TrendingUp, Fuel, Sprout, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  FX_RATES,
  COMMODITIES,
  FUEL_PRICES,
  MACRO_INDICATORS,
  trendArrow,
  trendClass,
} from "@/lib/civic-data";

export const Route = createFileRoute("/economy")({
  head: () => ({
    meta: [
      { title: "Economic Intelligence — CivicIntel" },
      { name: "description", content: "Indicative FX, fuel, commodity, and macro indicators for Kenya. Educational snapshot." },
    ],
  }),
  component: EconomyPage,
});

function EconomyPage() {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Economic Intelligence"
        title="Money, prices & the economy"
        description="An indicative snapshot for civic learning. Values are illustrative — verify on KNBS, CBK and EPRA for live data."
      />

      <Section icon={<ArrowLeftRight className="size-4" />} title="Currency converter">
        <Converter />
      </Section>

      <Section icon={<BarChart3 className="size-4" />} title="Key macro indicators">
        <ul className="grid grid-cols-2 gap-3 px-4">
          {MACRO_INDICATORS.map((m) => (
            <li key={m.label} className="rounded-2xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-serif text-2xl">{m.value}</p>
              <p className={"text-xs " + trendClass(m.trend)}>{trendArrow(m.trend)} {Math.abs(m.trend).toFixed(2)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{m.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<TrendingUp className="size-4" />} title="FX rates (KES per unit)">
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card mx-4 overflow-hidden">
          {FX_RATES.map((r) => (
            <li key={r.code} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl" aria-hidden="true">{r.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.code}</p>
                <p className="text-[11px] text-muted-foreground">{r.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">KES {r.rate.toFixed(2)}</p>
                <p className={"text-[11px] " + trendClass(r.trend)}>{trendArrow(r.trend)} {Math.abs(r.trend).toFixed(2)}%</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<Fuel className="size-4" />} title="Fuel prices (KES/L)">
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Product</th>
                <th className="px-3 py-2 text-right font-medium">Nairobi</th>
                <th className="px-3 py-2 text-right font-medium">Mombasa</th>
                <th className="px-3 py-2 text-right font-medium">Kisumu</th>
              </tr>
            </thead>
            <tbody>
              {FUEL_PRICES.map((f) => (
                <tr key={f.product} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{f.product}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{f.nairobi.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{f.mombasa.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{f.kisumu.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 px-5 text-[11px] text-muted-foreground">
          Indicative monthly EPRA pricing. Verify on the EPRA website for the current cycle.
        </p>
      </Section>

      <Section icon={<Sprout className="size-4" />} title="Commodity prices">
        <ul className="space-y-2 px-4">
          {COMMODITIES.map((c) => (
            <li key={c.name} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.note}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{c.unit} {c.price.toLocaleString()}</p>
                <p className={"text-[11px] " + trendClass(c.trend)}>{trendArrow(c.trend)} {Math.abs(c.trend).toFixed(1)}%</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center gap-2 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="ke-gradient-text">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function Converter() {
  const [amount, setAmount] = useState("100");
  const [code, setCode] = useState("USD");
  const rate = useMemo(() => FX_RATES.find((r) => r.code === code)?.rate ?? 0, [code]);
  const kes = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return 0;
    return n * rate;
  }, [amount, rate]);

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-label="Amount"
        />
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-label="Currency"
        >
          {FX_RATES.map((r) => (
            <option key={r.code} value={r.code}>{r.code}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 rounded-xl p-3 text-white" style={{ background: "var(--gradient-ke)" }}>
        <p className="text-[11px] uppercase tracking-wider opacity-80">Equivalent</p>
        <p className="font-serif text-2xl">KES {kes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}
