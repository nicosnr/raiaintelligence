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
    <article>
      <header className="bg-primary px-5 pt-8 pb-7 text-primary-foreground">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-primary-foreground/70"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back
        </Link>
        <h1 className="mt-3 text-2xl font-semibold leading-tight">{topic.title}</h1>
        <p className="mt-2 text-sm text-primary-foreground/80">{topic.summary}</p>
      </header>
      <div className="px-5 py-6 space-y-5">
        {topic.sections.map((s: { heading: string; body: string }) => (
          <section key={s.heading}>
            <h2 className="font-serif text-lg font-semibold">{s.heading}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/90">{s.body}</p>
          </section>
        ))}
        <p className="rounded-md border border-border bg-secondary p-3 text-xs text-secondary-foreground/80">
          Educational content only. Not legal advice.
        </p>
      </div>
    </article>
  );
}
