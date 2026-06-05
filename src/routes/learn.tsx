import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { topics } from "@/lib/civic-content";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — CivicIntel" },
      {
        name: "description",
        content: "Plain-language explainers on government, rights, and how laws are made.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  return (
    <div>
      <PageHeader
        eyebrow="Civic literacy"
        title="Learn"
        description="Short, neutral explainers on the foundations of civic life."
      />
      <ul className="space-y-3 px-5 pb-6">
        {topics.map((t) => (
          <li key={t.slug}>
            <Link
              to="/learn/$slug"
              params={{ slug: t.slug }}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-surface-foreground"
            >
              <div className="flex-1">
                <p className="font-serif text-lg font-semibold leading-snug">{t.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
              </div>
              <ChevronRight className="mt-1 size-5 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
