import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Send, ShieldCheck, Sparkles } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask — CivicIntel" },
      {
        name: "description",
        content:
          "Ask a neutral, educational AI explainer about how government, rights, and civic processes work.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is judicial review?",
  "How does a bill become law?",
  "What is the difference between civil rights and civil liberties?",
];

function AssistantPage() {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <PageHeader
        eyebrow="Educational explainer"
        title="Ask CivicIntel"
        description="A neutral AI guide. It explains concepts — not legal advice, not political commentary."
      />

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Ground rules
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              I can explain civic concepts — how government is structured, how
              laws are made, what categories of rights exist. I won't give
              legal advice or take political positions.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Try
            </p>
            <ul className="mt-2 space-y-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => send(s)}
                    className="flex w-full items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:border-primary/40"
                  >
                    <Sparkles className="mt-0.5 size-4 text-accent" aria-hidden="true" />
                    <span>{s}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                : "mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-sm text-surface-foreground"
            }
          >
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
          </div>
        ))}

        {loading && (
          <div className="mr-auto rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-sm text-muted-foreground">
            Thinking…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 border-t border-border bg-surface px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="ask" className="sr-only">Ask a civic question</label>
          <textarea
            id="ask"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about a civic concept…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[15px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Educational only. Not legal advice or political commentary.
        </p>
      </form>
    </div>
  );
}
