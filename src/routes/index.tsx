import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { topics } from "@/lib/civic-content";
import jamhuriBg from "@/assets/jamhuri-bg.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicIntel — Civic knowledge for every Kenyan" },
      {
        name: "description",
        content:
          "Understand the Constitution, your rights, and how government works — in plain, non-partisan language. Jamhuri ya Kenya.",
      },
    ],
  }),
  component: Index,
});

const CATEGORIES = ["For you", "Rights", "Government", "Elections", "Public finance"] as const;

function Index() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("For you");
  const featured = topics[0];
  const rest = topics.slice(1);

  return (
    <div className="flex flex-col bg-background pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            CIVIC<span className="text-accent">INTEL</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background"
          >
            <Search className="size-[18px]" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Updates"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background"
          >
            <Bell className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Hero headline */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Jamhuri ya Kenya · Educational
        </p>
        <h1 className="mt-2 font-serif text-[40px] leading-[0.95] tracking-tight">
          Know your<br />rights. Know<br />your <span className="text-accent">country</span>.
        </h1>
      </section>

      {/* Pill tabs */}
      <div className="mt-6 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={
                "pill-tab" + (active === c ? " pill-tab-active" : "")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured card with Kenyan image */}
      <section className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold not-italic">Featured</h2>
          <Link to="/learn" className="text-xs font-medium text-accent">
            See all
          </Link>
        </div>
        <Link
          to="/learn/$slug"
          params={{ slug: featured.slug }}
          className="mt-3 block overflow-hidden rounded-3xl border border-border bg-card"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="relative aspect-[16/10] w-full"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 45%, oklch(0.16 0.02 260 / 0.7) 100%), url(${jamhuriBg.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
              Civic 101
            </span>
            <div className="absolute inset-x-3 bottom-3 text-primary-foreground">
              <p className="font-serif text-xl leading-tight">{featured.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              CI
            </div>
            <p className="text-xs text-muted-foreground">CivicIntel · 4 min read</p>
          </div>
        </Link>
      </section>

      {/* List */}
      <section className="px-5 pt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold not-italic">Latest explainers</h2>
          <Link to="/learn" className="text-xs font-medium text-accent">
            See all
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {rest.map((t) => (
            <li key={t.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: t.slug }}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-secondary font-serif text-2xl text-foreground/70">
                  {t.title.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-serif text-base leading-snug">{t.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs not-italic text-muted-foreground">
                    {t.summary}
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-accent not-italic">
                    Read explainer
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mx-5 mt-6 rounded-2xl border border-border bg-secondary p-3 text-[11px] not-italic text-muted-foreground">
        CivicIntel is educational only — never legal advice or political commentary.
      </p>
    </div>
  );
}
