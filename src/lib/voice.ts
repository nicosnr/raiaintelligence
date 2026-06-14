// Lightweight wrapper around the Web Speech API.
// Works in Chromium/Safari; returns null where unsupported.

export type Lang = "en" | "sw";

const BCP47: Record<Lang, string> = { en: "en-KE", sw: "sw-KE" };

type SR = typeof window extends never ? never : any;

function getSR(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function isVoiceInputSupported() {
  return !!getSR();
}

export function isSpeechOutputSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function startListening(opts: {
  lang: Lang;
  onResult: (text: string) => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
}) {
  const SR = getSR();
  if (!SR) {
    opts.onError?.("Voice input isn't supported on this browser.");
    return () => {};
  }
  const rec: any = new SR();
  rec.lang = BCP47[opts.lang];
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    const text = e.results?.[0]?.[0]?.transcript ?? "";
    if (text) opts.onResult(text);
  };
  rec.onerror = (e: any) => opts.onError?.(e.error || "voice-error");
  rec.onend = () => opts.onEnd?.();
  try { rec.start(); } catch (e) { opts.onError?.("Could not start microphone."); }
  return () => { try { rec.stop(); } catch {} };
}

export function speak(text: string, lang: Lang) {
  if (!isSpeechOutputSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = BCP47[lang];
  u.rate = 1;
  u.pitch = 1;
  synth.speak(u);
}

export function stopSpeaking() {
  if (isSpeechOutputSupported()) window.speechSynthesis.cancel();
}
