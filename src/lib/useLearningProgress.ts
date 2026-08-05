import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { topics } from "@/lib/civic-content";

export function useLearningProgress() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id ?? null;
    setUserId(uid);

    if (!uid) {
      setDisplayName(null);
      setCompletedSlugs(new Set());
      setBookmarkedSlugs(new Set());
      setLoading(false);
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
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markComplete = useCallback(
    async (slug: string) => {
      if (!userId) return;
      setCompletedSlugs((s) => new Set(s).add(slug));
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
    [userId, refresh],
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
  };
}
