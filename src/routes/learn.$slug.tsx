import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { topics } from "@/lib/civic-content";

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
  return (
    <article className="bg-background pb-28">
      <header className="px-5 pt-6 pb-4">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground not-italic"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back
        </Link>
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
        <p className="rounded-2xl border border-border bg-secondary p-3 text-xs not-italic text-muted-foreground">
          Educational content only. Not legal advice.
        </p>
      </div>
    </article>
  );
}

