import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Flame } from "lucide-react";
import { topics } from "@/lib/civic-content";
import { PageHeader } from "@/components/PageHeader";
import { useLearningProgress } from "@/lib/useLearningProgress";

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
  const { userId, completedSlugs, total, completedCount, percent, streak, bestStreak } = useLearningProgress();

  return (
    <div>
      <PageHeader
        eyebrow="Civic literacy"
        title="Learn"
        description="Short, neutral explainers on the foundations of civic life."
      />
      {userId && (
        <div className="mx-5 mb-4 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Daily streak</p>
                <p className="mt-1 flex items-center gap-2 font-serif text-lg italic leading-none">
                  <Flame className="size-4 text-amber-500" />
                  {streak} day{streak === 1 ? "" : "s"}
                </p>
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">Best {bestStreak}</div>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">Complete one explainer today to keep your streak alive.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-end justify-between">
              <p className="font-serif text-lg italic leading-none">{completedCount} of {total} learned</p>
              <span className="text-[11px] text-muted-foreground">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "var(--gradient-ke)" }} />
            </div>
          </div>
        </div>
      )}
      <ul className="space-y-3 px-5 pb-6">
        {topics.map((t) => {
          const done = completedSlugs.has(t.slug);
          return (
            <li key={t.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: t.slug }}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-surface-foreground"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-serif text-lg font-semibold leading-snug">{t.title}</p>
                    {done && <CheckCircle2 className="size-4 shrink-0 text-[color:var(--ke-green)]" aria-label="Learned" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
                </div>
                <ChevronRight className="mt-1 size-5 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
