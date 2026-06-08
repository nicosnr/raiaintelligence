import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play } from "lucide-react";
import { REELS, type Reel, type Category, timeAgo, formatCount } from "@/lib/feed-content";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Watch — CivicIntel Reels" },
      { name: "description", content: "Short civic education videos for Kenyans — bite-size, neutral, non-partisan." },
    ],
  }),
  component: ReelsPage,
});

const CATEGORIES: Array<Category | "All"> = ["All", "Rights", "Government", "Elections", "Public Finance"];

function ReelsPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => (filter === "All" ? REELS : REELS.filter((r) => r.category === filter)), [filter]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Filter pills */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-14">
        <div className="pointer-events-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      className="relative flex h-[100dvh] w-full snap-start items-end justify-center animate-fade-up"
      style={{ background: reel.poster, animationDelay: `${index * 60}ms` }}
      aria-label={reel.title}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />

      {/* Play/pause tap target */}
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
        className="tap absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      {/* Right actions */}
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5 text-white">
        <ActionButton
          icon={<Heart className={"size-6 " + (liked ? "fill-current" : "")} />}
          label={formatCount(likes)}
          active={liked}
          onClick={toggleLike}
        />
        <ActionButton icon={<MessageCircle className="size-6" />} label={formatCount(reel.comments)} />
        <ActionButton icon={<Share2 className="size-6" />} label="Share" />
        <ActionButton
          icon={<Bookmark className={"size-6 " + (saved ? "fill-current" : "")} />}
          label="Save"
          active={saved}
          onClick={() => setSaved((v) => !v)}
        />
      </div>

      {/* Bottom overlay */}
      <div className="relative z-10 mx-auto mb-24 w-full max-w-[420px] px-4 text-white">
        <div className="flex items-center gap-3">
          <div
            className="ke-ring flex size-10 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: reel.avatarGradient }}
          >
            {reel.author.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">{reel.author}</p>
            <p className="text-[11px] text-white/70">
              {reel.handle} · {timeAgo(reel.postedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFollowing((v) => !v)}
            className={
              "tap rounded-full px-3.5 py-1.5 text-xs font-semibold " +
              (following ? "bg-white/15 text-white backdrop-blur" : "ke-gradient text-white shadow-[0_6px_18px_rgba(153,0,0,0.45)]")
            }
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
        <span className="mt-3 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
          {reel.category}
        </span>
        <h2 className="mt-2 font-serif text-xl leading-tight">{reel.title}</h2>
        <p className="mt-1 text-[13px] leading-snug text-white/85 not-italic">{reel.caption}</p>
      </div>
    </section>
  );
}

function ActionButton({
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
    <button type="button" onClick={onClick} className="tap flex flex-col items-center gap-1">
      <span
        className={
          "flex size-11 items-center justify-center rounded-full backdrop-blur transition-all " +
          (active ? "ke-gradient text-white" : "bg-white/15 text-white")
        }
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
