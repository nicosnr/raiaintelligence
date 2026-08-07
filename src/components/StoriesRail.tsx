import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { STORIES } from "@/lib/stories";
import type { Category } from "@/lib/feed-content";

export function StoriesRail({ onSelect }: { onSelect?: (category: Category | "All") => void }) {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});

  return (
    <div className="px-3 pb-3 pt-2">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Stories</p>
        <span className="text-[11px] text-white/50">Government & officials</span>
      </div>
      <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((s, i) => (
          <Link
            key={s.id}
            to={s.ctaTo ?? "/learn"}
            aria-label={`${s.name} — ${s.role}`}
            onClick={() => {
              setViewed((v) => ({ ...v, [s.id]: true }));
              onSelect?.(s.category);
            }}
            className="tap shrink-0 w-[172px] rounded-[20px] border border-white/10 bg-white/5 p-2 text-left"
          >
            <div className="relative mb-2 overflow-hidden rounded-[16px]">
              {s.image ? (
                <img src={s.image} alt={s.name} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-[11px] font-bold text-white" style={{ background: s.gradient }}>
                  {i === 0 ? <Plus className="size-5" /> : s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {s.role}
              </span>
              {s.unread && !viewed[s.id] && (
                <span className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-black">
                  New
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="line-clamp-1 text-[12px] font-semibold text-white">{s.name}</p>
              <p className="line-clamp-2 text-[10px] text-white/65">{s.summary}</p>
              <p className="line-clamp-2 text-[10px] font-medium text-[color:var(--ke-green)]">What they should do: {s.whatTheyShouldDo}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
