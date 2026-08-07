import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight, TrendingUp, Fuel, Sprout, BarChart3,
  BookOpen, MapPin, Bell, Sparkles,
  ArrowDownLeft, ArrowUpRight, Wallet, Eye, EyeOff,
} from "lucide-react";
import {
  FX_RATES, COMMODITIES, FUEL_PRICES, MACRO_INDICATORS,
  trendArrow, trendClass,
} from "@/lib/civic-data";

export const Route = createFileRoute("/economy")({
  head: () => ({
    meta: [
      { title: "Economic Intelligence — CivicIntel" },
      { name: "description", content: "Indicative FX, fuel, commodity, and macro indicators for Kenya — premium finance dashboard." },
    ],
  }),
  component: EconomyPage,
});

// Illustrative transactions
const TX = [
  { id: "t1", who: "Treasury · Equitable Share", note: "Disbursed to Nairobi County", amount: +1_240_000, when: "Today 09:12" },
  { id: "t2", who: "KRA · iTax", note: "PAYE remittance", amount: -331_500, when: "Yesterday 16:40" },
  { id: "t3", who: "CBK · Bond Coupon", note: "FXD1/2023/10Yr", amount: +5_312, when: "10 Jun" },
  { id: "t4", who: "EPRA · Fuel Levy", note: "Monthly settlement", amount: -1_550, when: "8 Jun" },
];

function EconomyPage() {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="bg-background pb-28">
      {/* Hero finance card — dark, glassy, gradient */}
      <section
        className="relative overflow-hidden rounded-b-[28px] px-4 pb-6 pt-5 text-white"
        style={{ background: "linear-gradient(155deg,#0b0b0f 0%,#1d0a14 45%,#0a2410 100%)" }}
      >
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(153,0,0,.55), transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(0,102,0,.5), transparent 70%)" }} />

        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15">
              <Wallet className="size-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Civic wallet</p>
              <p className="text-[13px] font-medium">Republic of Kenya — Indicative</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/assistant" aria-label="AI insights" className="tap flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15">
              <Sparkles className="size-4" />
            </Link>
            <Link to="/calendar" aria-label="Notifications" className="tap flex size-9 items-center justify-center rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15">
              <Bell className="size-4" />
            </Link>
          </div>
        </header>

        <div className="relative mt-6">
          <div className="flex items-center gap-2 text-[12px] text-white/65">
            Indicative reserves balance
            <button onClick={() => setHidden((v) => !v)} aria-label="Toggle visibility" className="tap text-white/70">
              {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
          <p className="mt-1 font-serif text-[44px] leading-none italic tracking-tight">
            {hidden ? "KES ••••••" : "KES 3,434.80B"}
          </p>
          <p className="mt-2 text-[12px] text-white/65">
            <span className="text-[color:var(--ke-green)]">▲ 0.42%</span> vs last month · public-market snapshot
          </p>
        </div>

        {/* Quick action pills — these figures are illustrative only, so actions
            point to real civic-finance content rather than any money movement. */}
        <div className="relative mt-5 grid grid-cols-2 gap-2">
          <QuickAction icon={<BookOpen className="size-4" />} label="Learn public finance" to="/learn" />
          <QuickAction icon={<MapPin className="size-4" />} label="County allocations" to="/counties" />
        </div>
      </section>

      <section className="mx-4 mt-4 rounded-2xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[color:var(--ke-green)]" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated this week</p>
        </div>
        <p className="mt-2 text-sm font-semibold">Kenya’s economic pulse is still shaped by fuel costs, food prices, and public spending decisions.</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Use the links below to follow the story from the budget cycle to county allocations.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/learn" className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground">Budget basics</Link>
          <Link to="/counties" className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground">County allocations</Link>
          <Link to="/representatives" className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground">Who decides?</Link>
        </div>
      </section>

      {/* Invite / converter strip */}
      <section className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3 text-white"
          style={{ background: "linear-gradient(145deg,#990000 0%,#3d0a0a 100%)" }}
        >
          <p className="text-[11px] uppercase tracking-wider text-white/70">Quick convert</p>
          <Converter compact />
        </div>
        <div className="rounded-2xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Civic literacy</p>
          <p className="mt-1 font-serif text-base italic leading-tight">Where do your taxes go?</p>
          <p className="mt-1 text-[11px] text-muted-foreground">A 2-minute explainer of the budget cycle.</p>
          <Link to="/learn" className="tap mt-2 inline-block rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">Learn now</Link>
        </div>
      </section>

      {/* Transactions */}
      <Section icon={<ArrowLeftRight className="size-4" />} title="Transactions">
        <ul
          className="mx-4 divide-y divide-white/5 overflow-hidden rounded-2xl text-white"
          style={{ background: "linear-gradient(160deg,#0e0e12 0%,#16101a 100%)", boxShadow: "var(--shadow-card)" }}
        >
          {TX.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={
                  "flex size-9 items-center justify-center rounded-full " +
                  (t.amount > 0 ? "bg-[color:var(--ke-green)]/20 text-[color:var(--ke-green)]" : "bg-[color:var(--ke-red)]/25 text-white")
                }
              >
                {t.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{t.who}</p>
                <p className="truncate text-[11px] text-white/55">{t.note} · {t.when}</p>
              </div>
              <p className={"tabular-nums text-[13px] font-semibold " + (t.amount > 0 ? "text-[color:var(--ke-green)]" : "text-white")}>
                {t.amount > 0 ? "+" : "−"}KES {Math.abs(t.amount).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<BarChart3 className="size-4" />} title="Key macro indicators">
        <ul className="grid grid-cols-2 gap-3 px-4">
          {MACRO_INDICATORS.map((m) => (
            <li key={m.label} className="rounded-2xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-serif text-2xl italic">{m.value}</p>
              <p className={"text-xs " + trendClass(m.trend)}>{trendArrow(m.trend)} {Math.abs(m.trend).toFixed(2)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{m.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={<TrendingUp className="size-4" />} title="FX rates (KES per unit)">
        <ul className="mx-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {FX_RATES.map((r) => (
            <li key={r.code} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl" aria-hidden="true">{r.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.code}</p>
                <p className="text-[11px] text-muted-foreground">{r.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">KES {r.rate.toFixed(2)}</p>
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
                <p className="text-sm font-semibold tabular-nums">{c.unit} {c.price.toLocaleString()}</p>
                <p className={"text-[11px] " + trendClass(c.trend)}>{trendArrow(c.trend)} {Math.abs(c.trend).toFixed(1)}%</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: "/learn" | "/counties" }) {
  return (
    <Link
      to={to}
      className="tap flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-2 py-3 text-white ring-1 ring-white/15 backdrop-blur"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-white/15">{icon}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}

function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="ke-gradient-text">{icon}</span>
          {title}
        </div>
        {subtitle && <button className="text-[11px] font-semibold text-muted-foreground">{subtitle}</button>}
      </div>
      {children}
    </section>
  );
}

function Converter({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState("100");
  const [code, setCode] = useState("USD");
  const rate = useMemo(() => FX_RATES.find((r) => r.code === code)?.rate ?? 0, [code]);
  const kes = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n * rate : 0;
  }, [amount, rate]);

  return (
    <div className={compact ? "mt-1" : "mx-4 rounded-2xl border border-border bg-card p-4"}>
      <div className="flex gap-1.5">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="min-w-0 flex-1 rounded-lg bg-white/15 px-2 py-1.5 text-sm font-semibold text-white placeholder-white/50 focus:outline-none"
          aria-label="Amount"
        />
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-lg bg-white/15 px-2 py-1.5 text-[11px] font-semibold text-white focus:outline-none"
          aria-label="Currency"
        >
          {FX_RATES.map((r) => (
            <option key={r.code} value={r.code} className="text-black">{r.code}</option>
          ))}
        </select>
      </div>
      <p className="mt-2 font-serif text-lg italic leading-tight">
        KES {kes.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
