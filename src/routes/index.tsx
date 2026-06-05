import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Landmark, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { topics } from "@/lib/civic-content";
import { FlagStripe } from "@/components/FlagStripe";
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

const quickLinks = [
  { to: "/learn", label: "Learn", desc: "Constitution & government", Icon: BookOpen },
  { to: "/representatives", label: "Leaders", desc: "Official directories", Icon: Landmark },
  { to: "/glossary", label: "Glossary", desc: "Plain-language terms", Icon: Search },
  { to: "/assistant", label: "Ask", desc: "Educational AI explainer", Icon: MessagesSquare },
] as const;

function Index() {
  return (
    <div className="flex flex-col">
      <FlagStripe />
      <header
        className="relative overflow-hidden px-6 pt-10 pb-10 text-primary-foreground"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.18 0.03 260 / 0.78) 0%, oklch(0.18 0.03 260 / 0.92) 100%), url(${jamhuriBg.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/75">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Non-partisan · Educational
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">CivicIntel</h1>
        <p className="mt-2 max-w-[28ch] text-sm text-primary-foreground/85">
          Understand the Constitution, your rights, and how government works —
          in plain language.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 font-serif text-[11px] tracking-[0.2em] text-primary-foreground/80">
          JAMHURI YA KENYA
        </p>
      </header>
      <FlagStripe />


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
