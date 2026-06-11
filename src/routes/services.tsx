import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SERVICE_PLACES, type ServicePlace } from "@/lib/civic-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Service Locator — CivicIntel" },
      { name: "description", content: "Huduma, hospitals, police stations, courts and legal aid near you." },
    ],
  }),
  component: ServicesPage,
});

const TYPES = ["All", "Huduma", "Hospital", "Police", "Court", "County office", "Legal aid"] as const;

function ServicesPage() {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_PLACES.filter((p) => {
      if (filter !== "All" && p.type !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.county.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Service locator"
        title="Find a public service"
        description="Huduma Centres, hospitals, police, courts, county offices and legal aid. Tap a card to open in your maps app."
      />

      <div className="px-5 pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, county or address…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          aria-label="Search services"
        />
      </div>

      <div className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={"pill-tab" + (filter === t ? " pill-tab-active" : "")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3 px-4">
        {list.map((p, i) => (
          <li key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <PlaceCard p={p} />
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No services match your filters yet.
          </li>
        )}
      </ul>
    </div>
  );
}

function PlaceCard({ p }: { p: ServicePlace }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  return (
    <article className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
            {p.type}
          </span>
          <p className="mt-1.5 font-serif text-lg leading-tight">{p.name}</p>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" /> {p.address} · {p.county}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" /> {p.hours}
          </p>
          {p.phone && (
            <p className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground">
              <Phone className="size-3" aria-hidden="true" />
              <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">
                {p.phone}
              </a>
            </p>
          )}
        </div>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tap mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
        style={{ background: "var(--gradient-ke)" }}
      >
        <Navigation className="size-3.5" /> Open in maps
      </a>
    </article>
  );
}
