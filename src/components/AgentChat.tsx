import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type ReactNode } from "react";
import { Send, ShieldCheck, Sparkles } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { PageHeader } from "@/components/PageHeader";

type Msg = { role: "user" | "assistant"; content: string };

export type AgentChatProps = {
  persona: "civic" | "sentinel" | "justice" | "civicgov";
  eyebrow: string;
  title: string;
  description: string;
  groundRules: ReactNode;
  suggestions: string[];
  accentGradient?: string;
};

export function AgentChat({
  persona,
  eyebrow,
  title,
  description,
  groundRules,
  suggestions,
  accentGradient = "linear-gradient(135deg,#000 0%,#990000 55%,#006600 100%)",
}: AgentChatProps) {
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
      const { reply } = await ask({ data: { persona, messages: next } });
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
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-3">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-4" style={{ color: "var(--ke-red)" }} aria-hidden="true" />
              Ground rules
            </div>
            <div className="mt-2 text-sm leading-relaxed text-foreground/90">{groundRules}</div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Try</p>
            <ul className="mt-2 space-y-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => send(s)}
                    className="tap flex w-full items-start gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm hover:border-[color:var(--ke-red)]/40"
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
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white"
                : "mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-sm text-surface-foreground"
            }
            style={m.role === "user" ? { background: accentGradient } : undefined}
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
          <label htmlFor="ask" className="sr-only">Ask a question</label>
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
            placeholder={`Ask ${title}…`}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[15px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="tap inline-flex size-11 items-center justify-center rounded-full text-white disabled:opacity-40"
            style={{ background: accentGradient }}
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Educational only. Not legal, medical, or political advice.
        </p>
      </form>
    </div>
  );
}
