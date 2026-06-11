import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CIVIC_EVENTS, type CivicEvent } from "@/lib/civic-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Civic Calendar — CivicIntel" },
      { name: "description", content: "Public holidays, participation forums, free services and civic events." },
    ],
  }),
  component: CalendarPage,
});

const TYPES = ["All", "Holiday", "Public participation", "Free service", "Scholarship", "Health", "Civic program"] as const;

function CalendarPage() {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");
  const list = useMemo(() => {
    const all = filter === "All" ? CIVIC_EVENTS : CIVIC_EVENTS.filter((e) => e.type === filter);
    return [...all].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [filter]);

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Civic Calendar"
        title="What's coming up"
        description="Holidays, public-participation forums, free services and civic programmes. Always confirm details before traveling."
      />

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
        {list.map((e, i) => (
          <li key={e.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <EventCard e={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventCard({ e }: { e: CivicEvent }) {
  const d = new Date(e.date);
  const day = d.toLocaleDateString("en-KE", { day: "2-digit" });
  const month = d.toLocaleDateString("en-KE", { month: "short" });
  return (
    <article className="flex gap-3 rounded-2xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
      <div
        className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white"
        style={{ background: "var(--gradient-ke)" }}
      >
        <span className="font-serif text-2xl leading-none">{day}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">{month}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
            {e.type}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold leading-tight">{e.title}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3" aria-hidden="true" /> {e.location}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-foreground/75 not-italic">{e.description}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarDays className="size-3" aria-hidden="true" />
          {d.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>
    </article>
  );
}
