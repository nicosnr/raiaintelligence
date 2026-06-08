import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Watch — CivicIntel Reels" },
      { name: "description", content: "Short civic education videos for Kenyans — bite-size, neutral, non-partisan." },
    ],
  }),
  component: ReelsPage,
});

type Reel = {
  id: string;
  title: string;
  author: string;
  handle: string;
  caption: string;
  poster: string;
};

const REELS: Reel[] = [
  {
    id: "1",
    title: "Article 43 — Social & economic rights",
    author: "CivicIntel",
    handle: "@civicintel",
    caption: "What Article 43 of the Constitution actually guarantees. #KnowYourRights",
    poster: "linear-gradient(135deg,#000 0%,#990000 60%,#006600 100%)",
  },
  {
    id: "2",
    title: "How a Bill becomes law in Kenya",
    author: "CivicIntel",
    handle: "@civicintel",
    caption: "From the first reading to assent — a 60-second tour. #Bunge",
    poster: "linear-gradient(160deg,#006600 0%,#000 55%,#990000 100%)",
  },
  {
    id: "3",
    title: "Devolution explained",
    author: "CivicIntel",
    handle: "@civicintel",
    caption: "47 counties, two levels of government, one Republic. #Devolution",
    poster: "linear-gradient(200deg,#990000 0%,#000 50%,#006600 100%)",
  },
];

function ReelsPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <div
        ref={scrollerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {REELS.map((r, i) => (
          <ReelCard key={r.id} reel={r} index={i} />
        ))}
      </div>
    </div>
  );
}

function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <section
      className="relative flex h-[100dvh] w-full snap-start items-end justify-center animate-fade-up"
      style={{ background: reel.poster, animationDelay: `${index * 60}ms` }}
      aria-label={reel.title}
    >
      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Mute toggle */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="tap absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      {/* Right-aligned actions */}
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5 text-white">
        <ActionButton
          icon={<Heart className={"size-6 " + (liked ? "fill-current" : "")} />}
          label={liked ? "1.2k" : "1.1k"}
          active={liked}
          onClick={() => setLiked((v) => !v)}
        />
        <ActionButton icon={<MessageCircle className="size-6" />} label="84" />
        <ActionButton icon={<Share2 className="size-6" />} label="Share" />
        <ActionButton
          icon={<Bookmark className={"size-6 " + (saved ? "fill-current" : "")} />}
          label="Save"
          active={saved}
          onClick={() => setSaved((v) => !v)}
        />
      </div>

      {/* Bottom profile overlay */}
      <div className="relative z-10 mx-auto mb-24 w-full max-w-[420px] px-4 text-white">
        <div className="flex items-center gap-3">
          <div className="ke-ring flex size-10 items-center justify-center rounded-full ke-gradient text-xs font-bold">
            CI
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">{reel.author}</p>
            <p className="text-[11px] text-white/70">{reel.handle}</p>
          </div>
          <button
            type="button"
            onClick={() => setFollowing((v) => !v)}
            className={
              "tap rounded-full px-3.5 py-1.5 text-xs font-semibold " +
              (following
                ? "bg-white/15 text-white backdrop-blur"
                : "ke-gradient text-white shadow-[0_6px_18px_rgba(153,0,0,0.45)]")
            }
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
        <h2 className="mt-3 font-serif text-xl leading-tight">{reel.title}</h2>
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
    <button
      type="button"
      onClick={onClick}
      className="tap flex flex-col items-center gap-1"
    >
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
