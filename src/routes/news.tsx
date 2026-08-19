import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NEWS, type NewsItem } from "@/lib/civic-data";
import { timeAgo } from "@/lib/feed-content";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News Hub — CivicIntel" },
      { name: "description", content: "Neutral, curated civic and economic updates from official Kenyan sources." },
    ],
  }),
  component: NewsPage,
});

const CATEGORIES = ["All", "Governance", "Public Finance", "Rights", "Elections", "County"] as const;

function NewsPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const list = useMemo(
    () => (filter === "All" ? NEWS : NEWS.filter((n) => n.category === filter)),
    [filter],
  );

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="News Hub · Curated"
        title="What's happening in civic life"
        description="A neutral feed of governance and public-finance updates. We summarise — verify with the listed source."
      />

      <div className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={"pill-tab" + (filter === c ? " pill-tab-active" : "")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-4 px-4">
        {list.map((n, i) => (
          <li key={n.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <NewsCard n={n} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsCard({ n }: { n: NewsItem }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      <div
        className="relative aspect-[16/9] w-full bg-cover bg-center"
        style={{
          backgroundImage: n.coverImage
            ? `linear-gradient(135deg, rgba(7,17,31,0.75) 0%, rgba(153,0,0,0.45) 55%, rgba(0,102,0,0.28) 100%), url(${n.coverImage})`
            : n.cover,
          backgroundColor: "#07111f",
        }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {n.category}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {n.source} · {timeAgo(n.publishedAt)}
        </p>
        <h2 className="mt-1 font-serif text-lg leading-tight">{n.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80 not-italic">{n.summary}</p>
      </div>
    </article>
  );
}
