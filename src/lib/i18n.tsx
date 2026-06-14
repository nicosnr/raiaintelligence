import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "sw";

type Dict = Record<string, { en: string; sw: string }>;

const DICT: Dict = {
  "nav.home": { en: "Home", sw: "Nyumbani" },
  "nav.news": { en: "News", sw: "Habari" },
  "nav.reels": { en: "Reels", sw: "Reels" },
  "nav.learn": { en: "Learn", sw: "Jifunze" },
  "nav.ask": { en: "Ask", sw: "Uliza" },
  "settings.language": { en: "Language", sw: "Lugha" },
  "settings.language.desc": { en: "Switch between English and Kiswahili.", sw: "Badilisha kati ya Kiingereza na Kiswahili." },
  "voice.listen": { en: "Tap to speak", sw: "Gusa kuongea" },
  "voice.listening": { en: "Listening…", sw: "Inasikiliza…" },
  "voice.speak": { en: "Read answer aloud", sw: "Soma jibu kwa sauti" },
  "voice.stop": { en: "Stop reading", sw: "Acha kusoma" },
  "counties.title": { en: "Counties of Kenya", sw: "Kaunti za Kenya" },
  "counties.desc": { en: "All 47 counties — capital, governor's seat and key civic facts.", sw: "Kaunti zote 47 — makao makuu na taarifa muhimu za uraia." },
  "counties.search": { en: "Search counties", sw: "Tafuta kaunti" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem("ci-lang");
      if (v === "sw" || v === "en") setLangState(v);
    } catch {}
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("ci-lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);
  const t = useCallback((key: string) => DICT[key]?.[lang] ?? key, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useI18n() {
  return useContext(LangCtx);
}
