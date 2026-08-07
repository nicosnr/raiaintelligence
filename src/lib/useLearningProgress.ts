import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { topics } from "@/lib/civic-content";

type StoredStreak = {
  streak: number;
  bestStreak: number;
  lastActive: string | null;
};

function readStoredStreak(): StoredStreak {
  if (typeof window === "undefined") return { streak: 0, bestStreak: 0, lastActive: null };
  try {
    const raw = window.localStorage.getItem("ci-learning-streak");
    if (!raw) return { streak: 0, bestStreak: 0, lastActive: null };
    const parsed = JSON.parse(raw) as Partial<StoredStreak>;
    return {
      streak: Number(parsed.streak ?? 0),
      bestStreak: Number(parsed.bestStreak ?? 0),
      lastActive: parsed.lastActive ?? null,
    };
  } catch {
    return { streak: 0, bestStreak: 0, lastActive: null };
  }
}

function saveStoredStreak(next: StoredStreak) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("ci-learning-streak", JSON.stringify(next));
}

function computeNextStreak(current: StoredStreak, today: string): StoredStreak {
  if (!current.lastActive) {
    return { streak: 1, bestStreak: Math.max(current.bestStreak, 1), lastActive: today };
  }

  const lastDate = new Date(`${current.lastActive}T00:00:00`);
  const todayDate = new Date(`${today}T00:00:00`);
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return { ...current, lastActive: today };
  }

  const nextStreak = diffDays === 1 ? current.streak + 1 : 1;
  const nextBest = Math.max(current.bestStreak, nextStreak);

  return { streak: nextStreak, bestStreak: nextBest, lastActive: today };
}

export function useLearningProgress() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);

  const refreshStreak = useCallback(() => {
    const stored = readStoredStreak();
    setStreak(stored.streak);
    setBestStreak(stored.bestStreak);
    setLastActiveDate(stored.lastActive);
  }, []);

  const refresh = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id ?? null;
    setUserId(uid);

    if (!uid) {
      setDisplayName(null);
      setCompletedSlugs(new Set());
      setBookmarkedSlugs(new Set());
      setLoading(false);
      refreshStreak();
      return;
    }

    const [{ data: profile }, { data: progress }, { data: bookmarks }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle(),
      supabase.from("learning_progress").select("topic_slug, completed_at").eq("user_id", uid),
      supabase.from("bookmarks").select("topic_slug").eq("user_id", uid),
    ]);

    setDisplayName(profile?.display_name ?? null);
    setCompletedSlugs(
      new Set((progress ?? []).filter((p) => p.completed_at).map((p) => p.topic_slug)),
    );
    setBookmarkedSlugs(new Set((bookmarks ?? []).map((b) => b.topic_slug)));
    setLoading(false);
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordDailyActivity = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const current = readStoredStreak();
    const next = computeNextStreak(current, today);
    saveStoredStreak(next);
    setStreak(next.streak);
    setBestStreak(next.bestStreak);
    setLastActiveDate(next.lastActive);
  }, []);

  const markComplete = useCallback(
    async (slug: string) => {
      setCompletedSlugs((s) => new Set(s).add(slug));
      recordDailyActivity();

      if (!userId) return;

      const { error } = await supabase
        .from("learning_progress")
        .upsert(
          { user_id: userId, topic_slug: slug, completed_at: new Date().toISOString() },
          { onConflict: "user_id,topic_slug" },
        );
      if (error) {
        console.warn("[learning-progress] markComplete failed:", error);
        refresh();
      }
    },
    [userId, recordDailyActivity, refresh],
  );

  const toggleBookmark = useCallback(
    async (slug: string) => {
      if (!userId) return;
      const wasBookmarked = bookmarkedSlugs.has(slug);
      setBookmarkedSlugs((s) => {
        const next = new Set(s);
        if (wasBookmarked) next.delete(slug);
        else next.add(slug);
        return next;
      });
      const { error } = wasBookmarked
        ? await supabase.from("bookmarks").delete().eq("user_id", userId).eq("topic_slug", slug)
        : await supabase.from("bookmarks").insert({ user_id: userId, topic_slug: slug });
      if (error) {
        console.warn("[learning-progress] toggleBookmark failed:", error);
        refresh();
      }
    },
    [userId, bookmarkedSlugs, refresh],
  );

  const total = topics.length;
  const completedCount = completedSlugs.size;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  return {
    userId,
    displayName,
    completedSlugs,
    bookmarkedSlugs,
    loading,
    markComplete,
    toggleBookmark,
    total,
    completedCount,
    percent,
    streak,
    bestStreak,
    lastActiveDate,
  };
}
