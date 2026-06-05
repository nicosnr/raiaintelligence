import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Landmark, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { topics } from "@/lib/civic-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicIntel — Neutral civic knowledge" },
      {
        name: "description",
        content:
          "Learn how government works, what your rights are, and the meaning of civic terms — in plain, non-partisan language.",
      },
    ],
  }),
  component: Index,
});

const quickLinks = [
  { to: "/learn", label: "Learn", desc: "How government works", Icon: BookOpen },
  { to: "/representatives", label: "Representatives", desc: "Find who represents you", Icon: Landmark },
  { to: "/glossary", label: "Glossary", desc: "Plain-language definitions", Icon: Search },
  { to: "/assistant", label: "Ask", desc: "Educational AI explainer", Icon: MessagesSquare },
] as const;

function Index() {
  return (
    <div className="flex flex-col">
      <header className="bg-primary px-6 pt-10 pb-8 text-primary-foreground">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Non-partisan · Educational
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">CivicIntel</h1>
        <p className="mt-2 text-sm text-primary-foreground/80">
          A neutral utility for understanding government, rights, and civic life.
        </p>
      </header>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick access
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {quickLinks.map(({ to, label, desc, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 text-surface-foreground transition-colors hover:border-primary/30"
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span className="text-base font-semibold leading-tight">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-8 pb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Start learning
        </h2>
        <ul className="mt-3 space-y-3">
          {topics.slice(0, 3).map((t) => (
            <li key={t.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: t.slug }}
                className="block rounded-xl border border-border bg-surface p-4 text-surface-foreground"
              >
                <p className="font-serif text-lg font-semibold leading-snug">{t.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mx-5 mb-6 mt-2 rounded-xl border border-border bg-secondary p-4 text-xs text-secondary-foreground/80">
        CivicIntel is educational only. It is not legal advice, political
        commentary, or an endorsement of any candidate, party, or policy.
      </footer>
    </div>
  );
}
