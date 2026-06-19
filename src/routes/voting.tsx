import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, BarChart3, Plus, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/voting")({
  head: () => ({
    meta: [
      { title: "Voting — CivicIntel" },
      { name: "description", content: "Cast your vote on civic subjects of matter posted by administrators." },
    ],
  }),
  component: VotingPage,
});

type Topic = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  closes_at: string | null;
  created_at: string;
};
type Tally = { option_id: string; topic_id: string; label: string; position: number; votes: number };

function VotingPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function refresh() {
    setError(null);
    const [{ data: t, error: te }, { data: ta, error: tae }] = await Promise.all([
      supabase
        .from("voting_topics")
        .select("id, title, description, category, is_active, closes_at, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("voting_topic_tallies").select("option_id, topic_id, label, position, votes").order("position"),
    ]);
    if (te || tae) setError((te ?? tae)?.message ?? "Failed to load.");
    setTopics((t as Topic[]) ?? []);
    setTallies((ta as Tally[]) ?? []);

    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);
    if (u.user) {
      const [{ data: v }, { data: r }] = await Promise.all([
        supabase.from("voting_topic_votes").select("topic_id, option_id").eq("user_id", u.user.id),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      const m: Record<string, string> = {};
      (v ?? []).forEach((row: { topic_id: string; option_id: string }) => {
        m[row.topic_id] = row.option_id;
      });
      setMyVotes(m);
      setIsAdmin((r ?? []).some((x: { role: string }) => x.role === "admin"));
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function vote(topicId: string, optionId: string) {
    if (!userId) return;
    setError(null);
    await supabase.from("voting_topic_votes").delete().eq("topic_id", topicId).eq("user_id", userId);
    const { error } = await supabase
      .from("voting_topic_votes")
      .insert({ topic_id: topicId, option_id: optionId, user_id: userId });
    if (error) return setError(error.message);
    setMyVotes((m) => ({ ...m, [topicId]: optionId }));
    refresh();
  }

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Civic voting"
        title="Subjects of matter"
        description="Admin-curated topics that affect Kenyans. Cast one vote per subject — your choice stays private."
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
            Results are visible to everyone. Only signed-in users can vote.
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

      {isAdmin && (
        <div className="mx-4 mb-3 flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm">
          <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <ShieldCheck className="size-4 text-[color:var(--ke-green)]" /> Admin tools
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="tap flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "var(--gradient-ke)" }}
          >
            <Plus className="size-3.5" /> New topic
          </button>
        </div>
      )}

      <ul className="space-y-4 px-4">
        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            options={tallies.filter((o) => o.topic_id === t.id).sort((a, b) => a.position - b.position)}
            myVote={myVotes[t.id]}
            canVote={!!userId && t.is_active}
            onVote={(opt) => vote(t.id, opt)}
          />
        ))}
        {loading && <li className="text-sm text-muted-foreground">Loading topics…</li>}
        {!loading && topics.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            No subjects posted yet. {isAdmin ? "Create the first one." : "Check back soon."}
          </li>
        )}
      </ul>

      {showCreate && isAdmin && (
        <CreateTopicModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function TopicCard({
  topic,
  options,
  myVote,
  canVote,
  onVote,
}: {
  topic: Topic;
  options: Tally[];
  myVote?: string;
  canVote: boolean;
  onVote: (optionId: string) => void;
}) {
  const total = options.reduce((s, o) => s + Number(o.votes), 0);
  const showResults = !!myVote || !canVote;

  return (
    <article className="rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
          {topic.category}
        </span>
        {!topic.is_active && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Closed</span>
        )}
      </div>
      <h2 className="mt-2 font-serif text-lg leading-tight">{topic.title}</h2>
      {topic.description && <p className="mt-1 text-[12px] text-muted-foreground">{topic.description}</p>}

      <ul className="mt-3 space-y-2">
        {options.length === 0 && (
          <li className="text-[12px] text-muted-foreground">No options yet.</li>
        )}
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

function CreateTopicModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Governance");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim() || cleanOpts.length < 2) {
      setErr("Add a title and at least two options.");
      setBusy(false);
      return;
    }
    const { data: topic, error: te } = await supabase
      .from("voting_topics")
      .insert({ title: title.trim(), description: description.trim() || null, category })
      .select("id")
      .single();
    if (te || !topic) {
      setErr(te?.message ?? "Failed to create topic.");
      setBusy(false);
      return;
    }
    const { error: oe } = await supabase
      .from("voting_topic_options")
      .insert(cleanOpts.map((label, i) => ({ topic_id: topic.id, label, position: i })));
    setBusy(false);
    if (oe) {
      setErr(oe.message);
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-t-3xl border-t border-border bg-background p-5 animate-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg">New subject of matter</h3>
          <button onClick={onClose} className="tap rounded-full bg-secondary p-2"><X className="size-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-2.5">
          <input
            placeholder="Title (e.g. Should NHIF contributions be raised?)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            required
          />
          <textarea
            placeholder="Short, neutral description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          >
            {["Governance", "Economy", "Health", "Education", "Environment", "Justice", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Options</p>
            {options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder={`Option ${i + 1}`}
                  value={o}
                  onChange={(e) => setOptions((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions((arr) => arr.filter((_, j) => j !== i))}
                    className="tap rounded-xl border border-border px-3 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions((arr) => [...arr, ""])}
              className="tap w-full rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
            >
              + Add option
            </button>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="tap w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--gradient-ke)" }}
          >
            {busy ? "Publishing…" : "Publish topic"}
          </button>
        </form>
      </div>
    </div>
  );
}
