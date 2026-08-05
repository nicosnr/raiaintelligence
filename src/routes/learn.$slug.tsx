import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, CheckCircle2 } from "lucide-react";
import { topics } from "@/lib/civic-content";
import { useLearningProgress } from "@/lib/useLearningProgress";

export const Route = createFileRoute("/learn/$slug")({
  loader: ({ params }) => {
    const topic = topics.find((t) => t.slug === params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.topic.title} — CivicIntel` },
          { name: "description", content: loaderData.topic.summary },
        ]
      : [],
  }),
  errorComponent: ({ reset }) => (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">Couldn't load this topic.</p>
      <button onClick={reset} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Try again
      </button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-6 text-center">
      <p className="text-sm text-muted-foreground">Topic not found.</p>
      <Link to="/learn" className="mt-3 inline-block text-sm text-primary underline">Back to Learn</Link>
    </div>
  ),
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const { userId, completedSlugs, bookmarkedSlugs, markComplete, toggleBookmark } =
    useLearningProgress();
  const completed = completedSlugs.has(topic.slug);
  const bookmarked = bookmarkedSlugs.has(topic.slug);

  return (
    <article className="bg-background pb-28">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground not-italic"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Back
          </Link>
          {userId && (
            <button
              type="button"
              onClick={() => toggleBookmark(topic.slug)}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this explainer"}
              aria-pressed={bookmarked}
              className="tap flex size-8 items-center justify-center rounded-full border border-border bg-card"
            >
              <Bookmark className={"size-4 " + (bookmarked ? "fill-current text-accent" : "text-muted-foreground")} />
            </button>
          )}
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent not-italic">
          Explainer
        </p>
        <h1 className="mt-1.5 font-serif text-[34px] leading-[1] tracking-tight">
          {topic.title}
        </h1>
        <p className="mt-3 text-sm not-italic text-muted-foreground">{topic.summary}</p>
      </header>
      <div className="space-y-5 px-5 pt-2">
        {topic.sections.map((s: { heading: string; body: string }) => (
          <section key={s.heading} className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-serif text-xl leading-tight">{s.heading}</h2>
            <p className="mt-2 text-[15px] leading-relaxed not-italic text-foreground/85">
              {s.body}
            </p>
          </section>
        ))}

        {userId ? (
          <button
            type="button"
            onClick={() => markComplete(topic.slug)}
            disabled={completed}
            className={
              "tap flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold " +
              (completed
                ? "border border-border bg-secondary text-muted-foreground"
                : "text-white")
            }
            style={completed ? undefined : { background: "var(--gradient-ke)" }}
          >
            <CheckCircle2 className="size-4" />
            {completed ? "Learned" : "Mark as learned"}
          </button>
        ) : (
          <Link
            to="/auth"
            className="tap block rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground"
          >
            Sign in to track your progress across explainers
          </Link>
        )}

        <p className="rounded-2xl border border-border bg-secondary p-3 text-xs not-italic text-muted-foreground">
          Educational content only. Not legal advice.
        </p>
      </div>
    </article>
  );
}

