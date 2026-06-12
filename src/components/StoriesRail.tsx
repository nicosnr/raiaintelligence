import { Plus } from "lucide-react";
import { STORIES } from "@/lib/stories";

export function StoriesRail() {
  return (
    <div className="px-3 pt-2 pb-3">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Stories</p>
        <span className="text-[11px] text-white/50">Government & officials</span>
      </div>
      <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((s, i) => (
          <button key={s.id} type="button" className="tap shrink-0 flex flex-col items-center gap-1.5 w-[64px]">
            <span className="relative block">
              <span
                className={
                  "block rounded-full p-[2px] " +
                  (s.unread
                    ? "bg-[conic-gradient(from_140deg,#990000,#006600,#000,#990000)]"
                    : "bg-white/15")
                }
              >
                <span
                  className="flex size-[58px] items-center justify-center rounded-full ring-2 ring-black text-[11px] font-bold text-white"
                  style={{ background: s.gradient }}
                >
                  {i === 0 ? <Plus className="size-5" /> : s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </span>
              {i === 0 && (
                <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-black">
                  <Plus className="size-3" />
                </span>
              )}
            </span>
            <span className="line-clamp-1 text-[10px] font-medium text-white/85">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
