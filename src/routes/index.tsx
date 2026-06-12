import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, Search, ShieldCheck, Eye, EyeOff, ArrowUpRight, Plus,
  Newspaper, Play, LayoutGrid, BookOpen, TrendingUp, CalendarDays,
  MapPin, Landmark, Scale, Building2, BarChart3, UserCircle, Settings,
} from "lucide-react";
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

const QUICK_ACTIONS = [
  { to: "/news", label: "News", icon: Newspaper, group: "Feed" },
  { to: "/reels", label: "Reels", icon: Play, group: "Feed" },
  { to: "/posts", label: "Posts", icon: LayoutGrid, group: "Feed" },
  { to: "/learn", label: "Learn", icon: BookOpen, group: "Feed" },
  { to: "/economy", label: "Economy", icon: TrendingUp, group: "Civic data" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, group: "Civic data" },
  { to: "/services", label: "Services", icon: MapPin, group: "Civic data" },
  { to: "/representatives", label: "Reps", icon: Landmark, group: "Civic data" },
  { to: "/glossary", label: "Glossary", icon: Search, group: "Civic data" },
  { to: "/agents/sentinel", label: "Sentinel", icon: ShieldCheck, group: "AI agents" },
  { to: "/agents/justice", label: "Justice", icon: Scale, group: "AI agents" },
  { to: "/agents/civicgov", label: "CivicGov", icon: Building2, group: "AI agents" },
  { to: "/polls", label: "Polls", icon: BarChart3, group: "Community" },
  { to: "/profile", label: "Profile", icon: UserCircle, group: "Account" },
  { to: "/settings", label: "Settings", icon: Settings, group: "Account" },
] as const;

function Index() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("For you");
  const [hidden, setHidden] = useState(false);
  const featured = topics[0];
  const rest = topics.slice(1, 4);

  const groups = Array.from(new Set(QUICK_ACTIONS.map((a) => a.group)));

  return (
    <div className="flex flex-col bg-background pb-28">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/profile" className="flex items-center gap-2.5">
          <div
            className="flex size-11 items-center justify-center rounded-full text-white ring-2 ring-white/10"
            style={{ background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" }}
            aria-hidden="true"
          >
            <ShieldCheck className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Habari</p>
            <p className="text-sm font-semibold">Mwananchi</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button aria-label="Search" className="tap flex size-10 items-center justify-center rounded-full border border-border bg-card">
            <Search className="size-[18px]" />
          </button>
          <button aria-label="Notifications" className="tap relative flex size-10 items-center justify-center rounded-full border border-border bg-card">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[color:var(--ke-red,#990000)]" />
          </button>
        </div>
      </header>

      {/* Hero balance-style card */}
      <section className="px-4 pt-5">
        <div
          className="relative overflow-hidden rounded-3xl px-5 pb-6 pt-5 text-white"
          style={{ background: "linear-gradient(155deg,#0b0b0f 0%,#1d0a14 50%,#0a2410 100%)" }}
        >
          <div className="absolute -top-16 -right-12 h-48 w-48 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(153,0,0,.55), transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(0,102,0,.5), transparent 70%)" }} />

          <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/65">
            Civic knowledge balance
            <button onClick={() => setHidden((v) => !v)} aria-label="Toggle visibility" className="tap text-white/80">
              {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
          <p className="relative mt-1 font-serif text-[40px] leading-none italic tracking-tight">
            {hidden ? "•• topics" : "12 topics"}
          </p>
          <p className="relative mt-2 text-[12px] text-white/65">
            <span className="text-[color:var(--ke-green,#19a974)]">▲ 3 new</span> explainers this week
          </p>

          <div className="relative mt-5 grid grid-cols-2 gap-3">
            <StatCard
              tone="red"
              label="Rights"
              value="47 Articles"
              hint="Bill of Rights"
            />
            <StatCard
              tone="green"
              label="Government"
              value="3 Branches"
              hint="Checks & balances"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Quick Actions</h2>
          <Link to="/settings" className="text-xs font-medium text-muted-foreground">Edit</Link>
        </div>
        {groups.map((g) => (
          <div key={g} className="mt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
            <ul className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.filter((a) => a.group === g).map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="tap flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1 py-2.5 text-center text-[10.5px] font-semibold"
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-full text-white"
                      style={{ background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate w-full">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Pill tabs */}
      <div className="mt-6 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={"pill-tab" + (active === c ? " pill-tab-active" : "")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <section className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Featured</h2>
          <Link to="/learn" className="text-xs font-medium text-accent">See all</Link>
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
              backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%), url(${jamhuriBg.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
              Civic 101
            </span>
            <div className="absolute inset-x-3 bottom-3 text-white">
              <p className="font-serif text-xl leading-tight">{featured.title}</p>
              <p className="mt-1 text-[11px] text-white/80">CivicIntel · 4 min read</p>
            </div>
          </div>
        </Link>
      </section>

      {/* Latest list */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Latest explainers</h2>
          <Link to="/learn" className="text-xs font-medium text-accent">See all</Link>
        </div>
        <ul className="mt-3 space-y-3">
          {rest.map((t) => (
            <li key={t.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: t.slug }}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl text-white font-serif text-2xl"
                  style={{ background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" }}>
                  {t.title.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-serif text-base leading-snug">{t.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.summary}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Read explainer <ArrowUpRight className="size-3" />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mx-5 mt-6 rounded-2xl border border-border bg-secondary p-3 text-[11px] text-muted-foreground">
        CivicIntel is educational only — never legal advice or political commentary.
      </p>
    </div>
  );
}

function StatCard({ tone, label, value, hint }: { tone: "red" | "green"; label: string; value: string; hint: string }) {
  const bg =
    tone === "red"
      ? "linear-gradient(150deg,#990000 0%,#3d0a0a 100%)"
      : "linear-gradient(150deg,#006600 0%,#0a2410 100%)";
  return (
    <div className="relative overflow-hidden rounded-2xl p-3 text-white" style={{ background: bg }}>
      <div className="flex items-center justify-between">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
          <Plus className="size-4" />
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/70">{hint}</span>
      </div>
      <p className="mt-6 text-[12px] text-white/80">{label}</p>
      <p className="font-serif text-xl italic leading-tight">{value}</p>
    </div>
  );
}
