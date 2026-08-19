import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Heart, MessageCircle, Bookmark, Volume2, VolumeX, Play,
  Search, Bell, ChevronDown, Share2, Music2, BadgeCheck,
} from "lucide-react";
import { REELS, type Reel, type Category, timeAgo, formatCount } from "@/lib/feed-content";
import { shareContent } from "@/lib/utils";
import { StoriesRail } from "@/components/StoriesRail";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Reels — CivicIntel" },
      { name: "description", content: "Short civic education videos for Kenyans — neutral, non-partisan, with government & officials stories." },
    ],
  }),
  component: ReelsPage,
});

const CATEGORIES: Array<Category | "All"> = ["All", "Rights", "Government", "Elections", "Public Finance"];

function ReelsPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [tab, setTab] = useState<"Reels" | "Stories">("Reels");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => (filter === "All" ? REELS : REELS.filter((r) => r.category === filter)), [filter]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Top bar — Instagram-style */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div className="pointer-events-auto flex items-center justify-between px-4 pt-4">
          <Link to="/glossary" aria-label="Search" className="tap flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
            <Search className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setTab((t) => (t === "Reels" ? "Stories" : "Reels"))}
            className="tap flex items-center gap-1 rounded-full px-3 py-1.5 text-white"
          >
            <span className="font-serif text-lg leading-none">{tab}</span>
            <ChevronDown className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <Link to="/calendar" aria-label="Notifications" className="tap flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
              <Bell className="size-4" />
            </Link>
          </div>
        </div>

        {/* Stories rail */}
        <div className="pointer-events-auto bg-gradient-to-b from-black/65 to-transparent">
          <StoriesRail onSelect={setFilter} />
        </div>

        {/* Filter pills */}
        <div className="pointer-events-auto px-3 pb-3">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={
                    "tap shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur " +
                    (filter === c ? "ke-gradient text-white" : "bg-white/15 text-white")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((r, i) => (
          <ReelCard key={r.id} reel={r} index={i} />
        ))}
        {list.length === 0 && (
          <div className="flex h-full items-center justify-center text-white/70">No reels in this category yet.</div>
        )}
      </div>
    </div>
  );
}

function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const [likes, setLikes] = useState(reel.likes);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  function toggleLike() {
    setLiked((prev) => {
      setLikes((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  }

  return (
    <section
      className="relative flex h-[100dvh] w-full snap-start items-end justify-center animate-fade-up bg-cover bg-center"
      style={{
        backgroundImage: reel.poster,
        backgroundColor: "#07111f",
        animationDelay: `${index * 60}ms`,
      }}
      aria-label={reel.title}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85" />

      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play"}
        className="absolute inset-0 z-0"
      >
        {!playing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur">
              <Play className="size-7 fill-current" />
            </span>
          </span>
        )}
      </button>

      {/* Mute toggle */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="tap absolute right-3 top-[210px] z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      {/* Bottom block — caption + author + music + actions */}
      <div className="relative z-10 mx-auto w-full max-w-[480px] px-4 pb-24 text-white">
        {/* Caption */}
        <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
          {reel.category}
        </span>
        <h2 className="mt-2 font-serif text-2xl italic leading-tight">{reel.title}</h2>
        <p className="mt-1 text-[13px] leading-snug text-white/90">{reel.caption}</p>

        {/* Author row + Follow */}
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className="flex size-9 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white/30"
            style={{ background: reel.avatarGradient }}
          >
            {reel.author.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="flex items-center gap-1 text-[13px] font-semibold leading-tight">
              {reel.handle}
              <BadgeCheck className="size-3.5 fill-[color:var(--ke-green)] text-white" />
            </p>
            <p className="text-[11px] text-white/65">{timeAgo(reel.postedAt)} ago</p>
          </div>
          <button
            type="button"
            onClick={() => setFollowing((v) => !v)}
            className={
              "tap rounded-full px-3.5 py-1.5 text-xs font-semibold " +
              (following
                ? "border border-white/40 bg-white/10 text-white backdrop-blur"
                : "bg-white text-black")
            }
          >
            {following ? "Following" : "Follow"}
          </button>
          <button
            type="button"
            aria-label="Share"
            className="tap text-white"
            onClick={() => shareContent({ title: reel.title, text: reel.caption })}
          >
            <Share2 className="size-5" />
          </button>
        </div>

        {/* Inline action stats */}
        <div className="mt-3 flex items-center gap-5 text-white">
          <InlineAction
            icon={<Heart className={"size-[18px] " + (liked ? "fill-[color:var(--ke-red)] text-[color:var(--ke-red)]" : "")} />}
            label={formatCount(likes)}
            onClick={toggleLike}
          />
          <InlineAction icon={<MessageCircle className="size-[18px]" />} label={formatCount(reel.comments)} />
          <InlineAction
            icon={<Bookmark className={"size-[18px] " + (saved ? "fill-white" : "")} />}
            label={formatCount(Math.round(reel.likes * 0.12))}
            onClick={() => setSaved((v) => !v)}
          />
        </div>

        {/* Music ticker */}
        <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
          <Music2 className="size-3.5 text-white" />
          <p className="flex-1 truncate text-[11px] text-white/85">
            Original audio · {reel.author} · Civic explainer
          </p>
        </div>
      </div>
    </section>
  );
}

function InlineAction({
  icon,
  label,
  onClick,
}: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="tap flex items-center gap-1.5">
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </button>
  );
}
