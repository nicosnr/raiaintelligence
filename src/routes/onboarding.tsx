import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Landmark, Sparkles, ArrowRight, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — CivicIntel" },
      { name: "description", content: "A non-partisan civic knowledge utility for Kenyans. Learn how government works, your rights and the economy." },
    ],
  }),
  component: OnboardingPage,
});

const SLIDES = [
  {
    icon: <Landmark className="size-7" />,
    eyebrow: "Karibu",
    title: "Civic knowledge, simplified",
    body: "Learn how Bunge, the Executive and Judiciary work — in plain language, neutral, and Kenyan.",
    bg: "linear-gradient(155deg,#000 0%,#990000 60%,#006600 100%)",
  },
  {
    icon: <Sparkles className="size-7" />,
    eyebrow: "AI agents",
    title: "Sentinel, Justice & CivicGov",
    body: "Three specialised assistants for safety, legal literacy and public services. Ask anything.",
    bg: "linear-gradient(160deg,#0b0b0f 0%,#1d0a14 50%,#0a2410 100%)",
  },
  {
    icon: <ShieldCheck className="size-7" />,
    eyebrow: "Non-partisan",
    title: "Educational, never political",
    body: "We don't endorse parties or candidates. We point you to official sources — KNCHR, IEBC, KRA, CBK.",
    bg: "linear-gradient(155deg,#006600 0%,#000 55%,#990000 100%)",
  },
] as const;

function OnboardingPage() {
  const [i, setI] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(data.session));
      setCheckingAuth(false);
    }).catch(() => {
      if (!active) return;
      setIsLoggedIn(false);
      setCheckingAuth(false);
    });

    return () => {
      active = false;
    };
  }, []);

  function done() {
    try { localStorage.setItem("ci-onboarded", "1"); } catch {}
    navigate({ to: "/" });
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden text-white" style={{ background: slide.bg, transition: "background 600ms ease" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.15),transparent_70%)]" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <span className="block h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="font-serif text-base italic">CivicIntel</span>
          </div>
          <button onClick={done} className="text-[12px] font-medium text-white/70 hover:text-white">Skip</button>
        </div>

        <div className="animate-fade-up" key={i}>
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20">
            {slide.icon}
          </span>
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/70">{slide.eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl italic leading-tight">{slide.title}</h1>
          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-white/85">{slide.body}</p>
        </div>

        <div>
          <div className="mb-5 flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={"h-1 rounded-full transition-all " + (idx === i ? "w-8 bg-white" : "w-3 bg-white/35")}
              />
            ))}
          </div>
          <div className="mb-3 rounded-2xl border border-white/15 bg-black/15 p-3 text-sm text-white/85 backdrop-blur">
            <p className="font-medium text-white">{isLoggedIn ? "You’re signed in and ready to continue." : "Continue as a guest or sign in to save your profile and preferences."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => (last ? done() : setI(i + 1))}
              className="tap flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-black"
            >
              {last ? (checkingAuth ? "Preparing…" : "Enter CivicIntel") : "Continue"}
              <ArrowRight className="size-4" />
            </button>
            {!isLoggedIn && (
              <Link
                to="/auth"
                className="tap flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur"
              >
                <LogIn className="size-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
