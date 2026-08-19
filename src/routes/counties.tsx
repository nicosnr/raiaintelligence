import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { COUNTIES, REGIONS, type County } from "@/lib/counties";
import { getCountyFinance, formatKES } from "@/lib/county-finance";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/counties")({
  head: () => ({
    meta: [
      { title: "Counties of Kenya — CivicIntel" },
      { name: "description", content: "All 47 Kenyan counties — capitals, regions and civic facts." },
    ],
  }),
  component: CountiesPage,
});

function CountiesPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("All");
  const [active, setActive] = useState<County | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return COUNTIES.filter((c) => {
      if (region !== "All" && c.region !== region) return false;
      if (!needle) return true;
      return c.name.toLowerCase().includes(needle) || c.capital.toLowerCase().includes(needle);
    });
  }, [q, region]);

  return (
    <div className="pb-24">
      <PageHeader eyebrow="County governance" title={t("counties.title")} description={t("counties.desc")} />

      <div className="mx-4 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("counties.search")}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label={t("counties.search")}
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {["All", ...REGIONS].map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={
              "tap shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium " +
              (region === r
                ? "border-transparent text-white"
                : "border-border bg-card text-foreground/80")
            }
            style={region === r ? { background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" } : undefined}
          >
            {r}
          </button>
        ))}
      </div>

      <ul className="mx-4 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((c) => (
          <li key={c.code}>
            <button
              onClick={() => setActive(c)}
              className="tap flex h-full w-full flex-col items-start rounded-2xl border border-border bg-card p-3 text-left"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">#{String(c.code).padStart(3, "0")}</span>
              <span className="mt-0.5 text-sm font-semibold leading-tight">{c.name}</span>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" /> {c.capital}
              </span>
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="col-span-full rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No counties match your search.
          </li>
        )}
      </ul>

      {active && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[480px] rounded-t-3xl border-t border-border bg-background p-5 animate-fade-up"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{active.region} · County {active.code}</p>
            <h2 className="mt-1 font-serif text-2xl">{active.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" /> Capital: <span className="font-medium text-foreground">{active.capital}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {active.facts.map((f) => (
                <li key={f} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">{f}</li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-sm font-semibold">County finances</h3>
              <FinanceSummary code={active.code} />
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Devolved functions include health, agriculture, county roads, pre-primary education, and trade licensing (Constitution, Fourth Schedule).
            </p>
            <button
              onClick={() => setActive(null)}
              className="tap mt-4 w-full rounded-full bg-secondary py-2.5 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FinanceSummary({ code }: { code: number }) {
  const f = getCountyFinance(code);
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Allocation</span>
        <span className="font-medium text-foreground">{formatKES(f.allocation)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Spent</span>
        <span className="font-medium text-foreground">{formatKES(f.spent)}</span>
      </div>
      <div className="mt-2">
        <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-card">
          <div
            role="progressbar"
            aria-valuenow={f.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3 bg-gradient-to-r from-green-500 to-emerald-500"
            style={{ width: `${f.percent}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{f.percent}% of allocation spent</div>
      </div>
    </div>
  );
}
