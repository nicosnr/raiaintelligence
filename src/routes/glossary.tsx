import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { glossary } from "@/lib/civic-content";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary — CivicIntel" },
      { name: "description", content: "Plain-language definitions for common civic terms." },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return glossary;
    return glossary.filter(
      (e) =>
        e.term.toLowerCase().includes(needle) ||
        e.definition.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div>
      <PageHeader eyebrow="Reference" title="Glossary" description="Common civic terms, defined plainly." />
      <div className="px-5">
        <label htmlFor="glossary-search" className="sr-only">Search glossary</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="glossary-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms…"
            className="w-full rounded-lg border border-input bg-surface py-2.5 pl-9 pr-3 text-[15px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>
      <ul className="mt-4 divide-y divide-border px-5 pb-8">
        {filtered.map((e) => (
          <li key={e.term} className="py-4">
            <p className="font-serif text-base font-semibold">{e.term}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.definition}</p>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">No matches.</li>
        )}
      </ul>
    </div>
  );
}
