import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { POSTS, type Post, type Category, timeAgo, formatCount } from "@/lib/feed-content";

export const Route = createFileRoute("/posts")({
  head: () => ({
    meta: [
      { title: "Posts — CivicIntel" },
      { name: "description", content: "A social-style feed of bite-size civic explainers — neutral, non-partisan." },
    ],
  }),
  component: PostsPage,
});

const CATEGORIES: Array<Category | "All"> = ["All", "Rights", "Government", "Elections", "Public Finance"];

function PostsPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const list = useMemo(() => (filter === "All" ? POSTS : POSTS.filter((p) => p.category === filter)), [filter]);

  return (
    <div className="flex flex-col bg-background pb-28">
      <PageHeader
        eyebrow="Feed · Educational"
        title="Civic posts"
        description="Bite-size explainers in a familiar feed. Tap a card to expand the full breakdown."
      />

      <div className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={"pill-tab" + (filter === c ? " pill-tab-active" : "")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-4 px-4">
        {list.map((p, i) => (
          <li key={p.id} style={{ animationDelay: `${i * 70}ms` }} className="animate-fade-up">
            <PostCard post={p} />
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No posts in this category yet.
          </li>
        )}
      </ul>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function toggleLike() {
    setLiked((prev) => {
      setLikes((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      <header className="flex items-center gap-3 px-4 py-3">
        <div
          className="ke-ring flex size-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: post.avatarGradient }}
        >
          {post.author.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{post.author}</p>
          <p className="text-[11px] text-muted-foreground">
            {post.handle} · {timeAgo(post.postedAt)} · <Clock className="inline size-3 -mt-0.5" /> {post.readMinutes} min
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
          {post.category}
        </span>
      </header>

      <div className="relative aspect-[16/10] w-full" style={{ background: post.cover }}>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <p className="font-serif text-xl leading-tight">{post.title}</p>
        </div>
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-foreground/85 not-italic">{post.summary}</p>

        {/* Smooth grid-rows expand */}
        <div
          className={
            "grid transition-[grid-template-rows] duration-300 ease-out " +
            (expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
          }
        >
          <div className="overflow-hidden">
            <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-foreground/75 not-italic">
              {post.body}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="tap mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent"
        >
          {expanded ? "Show less" : "Read more"}
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={toggleLike}
            active={liked}
            icon={<Heart className={"size-[18px] " + (liked ? "fill-current" : "")} />}
            label={formatCount(likes)}
          />
          <IconBtn icon={<MessageCircle className="size-[18px]" />} label={formatCount(post.comments)} />
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
