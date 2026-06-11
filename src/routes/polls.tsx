import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/polls")({
  head: () => ({
    meta: [
      { title: "Civic Polls — CivicIntel" },
      { name: "description", content: "Anonymous civic polls. One vote per signed-in user, neutral topics only." },
    ],
  }),
  component: PollsPage,
});

type Poll = { id: string; question: string; description: string | null; category: string };
type Tally = { option_id: string; poll_id: string; label: string; position: number; votes: number };

function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({}); // pollId -> optionId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const [{ data: p, error: pe }, { data: t, error: te }] = await Promise.all([
      supabase.from("polls").select("id, question, description, category").eq("is_active", true).order("created_at"),
      supabase.from("poll_tallies").select("option_id, poll_id, label, position, votes").order("position"),
    ]);
    if (pe || te) {
      setError((pe ?? te)?.message ?? "Failed to load polls.");
    }
    setPolls((p as Poll[]) ?? []);
    setTallies((t as Tally[]) ?? []);

    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);
    if (u.user) {
      const { data: v } = await supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("user_id", u.user.id);
      const m: Record<string, string> = {};
      (v ?? []).forEach((row: { poll_id: string; option_id: string }) => {
        m[row.poll_id] = row.option_id;
      });
      setMyVotes(m);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function vote(pollId: string, optionId: string) {
    if (!userId) return;
    setError(null);
    // Replace any prior vote
    await supabase.from("poll_votes").delete().eq("poll_id", pollId).eq("user_id", userId);
    const { error } = await supabase
      .from("poll_votes")
      .insert({ poll_id: pollId, option_id: optionId, user_id: userId });
    if (error) {
      setError(error.message);
      return;
    }
    setMyVotes((m) => ({ ...m, [pollId]: optionId }));
    refresh();
  }

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Community · Anonymous"
        title="Civic polls"
        description="One vote per person on neutral civic topics. We show tallies — no comments, no leader ratings."
      />

      {error && (
        <div className="mx-4 mb-3 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {!userId && !loading && (
        <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="font-semibold">Sign in to cast your vote</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Tallies are visible to everyone. Only signed-in users can vote.
          </p>
          <Link
            to="/auth"
            className="tap mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "var(--gradient-ke)" }}
          >
            Sign in to vote
          </Link>
        </div>
      )}

      <ul className="space-y-4 px-4">
        {polls.map((p) => (
          <PollCard
            key={p.id}
            poll={p}
            options={tallies.filter((t) => t.poll_id === p.id).sort((a, b) => a.position - b.position)}
            myVote={myVotes[p.id]}
            canVote={!!userId}
            onVote={(opt) => vote(p.id, opt)}
          />
        ))}
        {loading && <li className="px-4 text-sm text-muted-foreground">Loading polls…</li>}
      </ul>
    </div>
  );
}

function PollCard({
  poll,
  options,
  myVote,
  canVote,
  onVote,
}: {
  poll: Poll;
  options: Tally[];
  myVote?: string;
  canVote: boolean;
  onVote: (optionId: string) => void;
}) {
  const total = options.reduce((s, o) => s + Number(o.votes), 0);
  const showResults = !!myVote || !canVote;

  return (
    <article className="rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
        {poll.category}
      </span>
      <h2 className="mt-2 font-serif text-lg leading-tight">{poll.question}</h2>
      {poll.description && <p className="mt-1 text-[12px] text-muted-foreground">{poll.description}</p>}

      <ul className="mt-3 space-y-2">
        {options.map((o) => {
          const votes = Number(o.votes);
          const pct = total ? Math.round((votes / total) * 100) : 0;
          const mine = myVote === o.option_id;
          return (
            <li key={o.option_id}>
              <button
                type="button"
                disabled={!canVote}
                onClick={() => onVote(o.option_id)}
                className="tap relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm disabled:cursor-default"
              >
                {showResults && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${pct}%`,
                      background: mine ? "var(--gradient-ke)" : "color-mix(in oklab, var(--ke-green) 12%, transparent)",
                      opacity: mine ? 0.9 : 1,
                    }}
                  />
                )}
                <span className={"relative z-10 flex items-center gap-2 " + (mine ? "text-white font-semibold" : "")}>
                  {mine && <CheckCircle2 className="size-4" />} {o.label}
                </span>
                {showResults && (
                  <span className={"relative z-10 text-xs tabular-nums " + (mine ? "text-white" : "text-muted-foreground")}>
                    {pct}%
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <BarChart3 className="size-3" /> {total} {total === 1 ? "vote" : "votes"}
      </p>
    </article>
  );
}
