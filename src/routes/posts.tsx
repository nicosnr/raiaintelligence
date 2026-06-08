import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { topics } from "@/lib/civic-content";

export const Route = createFileRoute("/posts")({
  head: () => ({
    meta: [
      { title: "Posts — CivicIntel" },
      { name: "description", content: "A social-style feed of bite-size civic explainers — neutral, non-partisan." },
    ],
  }),
  component: PostsPage,
});

function PostsPage() {
  return (
    <div className="flex flex-col bg-background pb-28">
      <PageHeader
        eyebrow="Feed · Educational"
        title="Civic posts"
        description="Bite-size explainers in a familiar feed. Tap a card to expand the full breakdown."
      />
      <ul className="space-y-4 px-4">
        {topics.map((t, i) => (
          <li key={t.slug} style={{ animationDelay: `${i * 70}ms` }} className="animate-fade-up">
            <PostCard
              slug={t.slug}
              title={t.title}
              summary={t.summary}
              body={t.sections.map((s) => `${s.heading}: ${s.body}`).join("\n\n")}
              index={i}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostCard({
  title,
  summary,
  body,
  index,
}: {
  slug: string;
  title: string;
  summary: string;
  body: string;
  index: number;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const gradients = [
    "linear-gradient(135deg,#000 0%,#990000 60%,#006600 100%)",
    "linear-gradient(160deg,#006600 0%,#000 55%,#990000 100%)",
    "linear-gradient(200deg,#990000 0%,#000 50%,#006600 100%)",
  ];

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="ke-ring flex size-9 items-center justify-center rounded-full ke-gradient text-[11px] font-bold text-white">
          CI
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">CivicIntel</p>
          <p className="text-[11px] text-muted-foreground">Jamhuri ya Kenya · Educational</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
          Civic 101
        </span>
      </header>

      {/* Cover */}
      <div
        className="relative aspect-[16/10] w-full"
        style={{ background: gradients[index % gradients.length] }}
      >
        <div className="absolute inset-x-4 bottom-3 text-white">
          <p className="font-serif text-xl leading-tight">{title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-foreground/85 not-italic">{summary}</p>
        {expanded && (
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-foreground/75 not-italic animate-fade-up">
            {body}
          </p>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="tap mt-2 inline-flex items-center gap-1 text-[12px] font-semibold ke-gradient-text"
        >
          {expanded ? "Show less" : "Read more"}
          {expanded ? <ChevronUp className="size-3.5 text-accent" /> : <ChevronDown className="size-3.5 text-accent" />}
        </button>
      </div>

      {/* Action bar */}
      <div className="mt-3 flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => setLiked((v) => !v)}
            active={liked}
            icon={<Heart className={"size-[18px] " + (liked ? "fill-current" : "")} />}
            label={liked ? "243" : "242"}
          />
          <IconBtn icon={<MessageCircle className="size-[18px]" />} label="18" />
          <IconBtn icon={<Share2 className="size-[18px]" />} label="Share" />
        </div>
        <IconBtn
          onClick={() => setSaved((v) => !v)}
          active={saved}
          icon={<Bookmark className={"size-[18px] " + (saved ? "fill-current" : "")} />}
          label=""
        />
      </div>
    </article>
  );
}

function IconBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "tap inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors " +
        (active ? "text-accent" : "text-foreground/70 hover:text-foreground")
      }
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
