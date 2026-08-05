import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, Search, ShieldCheck, ArrowUpRight, ArrowRight,
  Newspaper, Play, BookOpen, TrendingUp, CalendarDays,
  MapPin, MessagesSquare, Scale, Building2,
} from "lucide-react";
import { useState } from "react";
import { topics } from "@/lib/civic-content";
import { getTopicImage, getCategoryImage } from "@/lib/topic-images";
import { useLearningProgress } from "@/lib/useLearningProgress";
import { useMoreSheet } from "./__root";

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

const SERVICES = [
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/reels", label: "Reels", icon: Play },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/economy", label: "Economy", icon: TrendingUp },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/services", label: "Services", icon: MapPin },
  { to: "/assistant", label: "Ask AI", icon: MessagesSquare },
  { to: "/agents/justice", label: "Justice", icon: Scale },
  { to: "/agents/civicgov", label: "CivicGov", icon: Building2 },
] as const;

const EVENTS = [
  { tag: "Live", title: "National Assembly: Public Finance debate", when: "Today · 2:30 PM", category: "budget" },
  { tag: "Hearing", title: "Senate County Allocation hearings", when: "Tomorrow · 10:00 AM", category: "devolution" },
  { tag: "Deadline", title: "KRA monthly VAT filing deadline", when: "20 Jun · End of day", category: "tax" },
] as const;

function Index() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("For you");
  const { open: openMore } = useMoreSheet();
  const featured = topics[0];
  const rest = topics.slice(1, 4);
  const featuredImage = getTopicImage(featured.slug);
  const { userId, displayName, total, completedCount, percent } = useLearningProgress();
  const remaining = total - completedCount;
  const explainerMessage =
    total === 0
      ? "No explainers published yet"
      : remaining === 0
        ? "You've completed every explainer"
        : `You have ${remaining} explainer${remaining === 1 ? "" : "s"} left to learn`;

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
          <Link to="/glossary" aria-label="Search" className="tap flex size-10 items-center justify-center rounded-full border border-border bg-card">
            <Search className="size-[18px]" />
          </Link>
          <Link to="/calendar" aria-label="Notifications" className="tap relative flex size-10 items-center justify-center rounded-full border border-border bg-card">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[color:var(--ke-red,#990000)]" />
          </Link>
        </div>
      </header>

      {/* Hero "welcome" card — inspired by the insurance app */}
      <section className="px-4 pt-5">
        <div
          className="relative overflow-hidden rounded-[28px] px-5 pb-5 pt-6 text-white"
          style={{
            background:
              "linear-gradient(135deg,#1a0808 0%,#5c1212 28%,#a32a1f 55%,#d97b3a 85%,#f4c98a 100%)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="absolute -top-16 -right-12 h-52 w-52 rounded-full"
               style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.35), transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full"
               style={{ background: "radial-gradient(closest-side, rgba(0,102,0,.45), transparent 70%)" }} />

          <p className="relative text-[12px] text-white/85">{userId ? "Welcome Back" : "Karibu"}</p>
          <h1 className="relative mt-1 font-serif text-[28px] leading-tight">{displayName ?? "Mwananchi"}</h1>

          {/* Status pill */}
          <Link
            to="/learn"
            className="relative mt-4 flex items-center gap-3 rounded-full bg-white/12 px-2 py-1.5 backdrop-blur ring-1 ring-white/20"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-[11px] font-bold text-[color:var(--ke-red,#990000)]">{remaining}</span>
            <span className="flex-1 text-[12.5px] font-medium">{explainerMessage}</span>
            <ArrowRight className="size-4 opacity-90" />
          </Link>

          {/* Knowledge meter card */}
          <div className="relative mt-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur ring-1 ring-white/15">
            <p className="text-[11px] uppercase tracking-wider text-white/75">Civic knowledge</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="font-serif text-2xl italic leading-none">{completedCount} topic{completedCount === 1 ? "" : "s"} learned</p>
              <span className="text-[11px] text-white/80">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white/85" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-between">
            <div className="text-[11px] text-white/80">Bill of Rights · Articles 19–59</div>
            <Link
              to="/assistant"
              className="tap rounded-full bg-black/55 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/15"
            >
              Ask CivicIntel
            </Link>
          </div>
        </div>
      </section>

      {/* Services — chip row */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Services</h2>
          <button onClick={openMore} className="text-xs font-medium text-muted-foreground">See all</button>
        </div>
        <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2">
            {SERVICES.map(({ to, label, icon: Icon }) => (
              <li key={to} className="shrink-0">
                <Link
                  to={to}
                  className="tap flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[12.5px] font-semibold"
                >
                  <span
                    className="flex size-6 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" }}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pill tabs */}
      <div className="mt-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {/* Events — horizontal card carousel */}
      <section className="mt-4 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Events</h2>
          <Link to="/calendar" className="text-xs font-medium text-accent">See all</Link>
        </div>
        <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-3">
            {EVENTS.map((e) => {
              const img = getCategoryImage(e.category);
              return (
              <li key={e.title} className="w-[230px] shrink-0">
                <Link
                  to="/calendar"
                  className="block overflow-hidden rounded-2xl border border-border bg-card"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div
                    role="img"
                    aria-label={img.alt}
                    className="relative aspect-[16/10] w-full"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%), url(${img.src})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      {e.tag}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{e.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{e.when}</p>
                  </div>
                </Link>
              </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Featured "card" */}
      <section className="mt-3 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Featured explainer</h2>
          <Link to="/learn" className="text-xs font-medium text-accent">See all</Link>
        </div>
        <Link
          to="/learn/$slug"
          params={{ slug: featured.slug }}
          className="mt-3 block overflow-hidden rounded-3xl border border-border bg-card"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            role="img"
            aria-label={featuredImage.alt}
            className="relative aspect-[16/10] w-full"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%), url(${featuredImage.src})`,
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
