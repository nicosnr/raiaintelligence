import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mic, MicOff, RotateCcw, Send, ShieldCheck, Sparkles, Volume2, VolumeX } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { isSpeechOutputSupported, isVoiceInputSupported, speak, startListening, stopSpeaking } from "@/lib/voice";

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
  const { lang } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const voiceIn = isVoiceInputSupported();
  const voiceOut = isSpeechOutputSupported();

  useEffect(() => () => { stopRef.current?.(); stopSpeaking(); }, []);

  function toggleMic() {
    if (listening) { stopRef.current?.(); setListening(false); return; }
    setError(null);
    setListening(true);
    stopRef.current = startListening({
      lang,
      onResult: (text) => { setInput((prev) => (prev ? prev + " " : "") + text); send(text); },
      onEnd: () => setListening(false),
      onError: (m) => { setError(m); setListening(false); },
    });
  }

  function toggleSpeak() {
    if (speaking) { stopSpeaking(); setSpeaking(false); setAutoSpeak(false); return; }
    setAutoSpeak(true);
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last) { speak(last.content, lang); setSpeaking(true); }
  }

  function formatError(message: string) {
    return message.startsWith("RATE_LIMIT:") ? message.slice("RATE_LIMIT:".length) : message;
  }

  async function requestReply(thread: Msg[]) {
    setError(null);
    setCanRetry(false);
    setLoading(true);
    try {
      const { reply } = await ask({ data: { persona, lang, messages: thread } });
      setMessages([...thread, { role: "assistant", content: reply }]);
      if (autoSpeak && voiceOut) {
        speak(reply, lang);
        setSpeaking(true);
      }
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong.";
      setError(formatError(raw));
      setCanRetry(true);
    } finally {
      setLoading(false);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    await requestReply(next);
  }

  async function retryLast() {
    if (loading || messages.length === 0) return;
    await requestReply(messages);
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
          <div
            className="mr-auto max-w-[90%] space-y-2 rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5"
            aria-live="polite"
            aria-busy="true"
          >
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <p>{error}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {canRetry && (
                <button
                  type="button"
                  onClick={retryLast}
                  disabled={loading}
                  className="tap inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Try again
                </button>
              )}
              {error.includes("Sign in") && (
                <Link
                  to="/auth"
                  className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
                >
                  Sign in
                </Link>
              )}
            </div>
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
          {voiceIn && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Speak"}
              aria-pressed={listening}
              className={
                "tap inline-flex size-11 shrink-0 items-center justify-center rounded-full border " +
                (listening ? "border-transparent text-white animate-pulse" : "border-input bg-background text-foreground")
              }
              style={listening ? { background: accentGradient } : undefined}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}
          {voiceOut && (
            <button
              type="button"
              onClick={toggleSpeak}
              aria-label={speaking ? "Stop reading" : "Read replies aloud"}
              aria-pressed={autoSpeak}
              className={
                "tap inline-flex size-11 shrink-0 items-center justify-center rounded-full border " +
                (autoSpeak ? "border-transparent text-white" : "border-input bg-background text-foreground")
              }
              style={autoSpeak ? { background: accentGradient } : undefined}
            >
              {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          )}
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
            placeholder={listening ? "Listening…" : `Ask ${title}…`}
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
