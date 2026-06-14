import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, Bell, ShieldCheck, Languages } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CivicIntel" },
      { name: "description", content: "App preferences and privacy." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ci-theme");
    setDark(stored === "dark");
    setNotif(localStorage.getItem("ci-notif") !== "off");
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ci-theme", next ? "dark" : "light");
  }

  function toggleNotif() {
    const next = !notif;
    setNotif(next);
    localStorage.setItem("ci-notif", next ? "on" : "off");
  }

  return (
    <div className="pb-24">
      <PageHeader eyebrow="App settings" title="Preferences" description="Control the experience and data on this device." />

      <div className="mx-4 mb-2 rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
            <Languages className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("settings.language")}</p>
            <p className="text-[11px] text-muted-foreground">{t("settings.language.desc")}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["en", "sw"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={
                "tap rounded-xl border px-3 py-2 text-sm font-medium " +
                (lang === l ? "border-transparent text-white" : "border-border bg-background")
              }
              style={lang === l ? { background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" } : undefined}
              aria-pressed={lang === l}
            >
              {l === "en" ? "English" : "Kiswahili"}
            </button>
          ))}
        </div>
      </div>

      <ul className="mx-4 space-y-2">
        <Row
          icon={dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          label="Dark mode"
          description="Switch the interface to midnight tones."
          checked={dark}
          onChange={toggleDark}
        />
        <Row
          icon={<Bell className="size-4" />}
          label="In-app notifications"
          description="Civic alerts and new explainers (this device only)."
          checked={notif}
          onChange={toggleNotif}
        />
      </ul>

      <div className="mx-4 mt-6 rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="size-4 text-[color:var(--ke-red)]" /> Our promise
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85 not-italic">
          CivicIntel is neutral and non-partisan. We do not host public comments, leader ratings, or
          political endorsements. Polls collect anonymous tallies only and are reviewed for neutrality.
        </p>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onChange}
        className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-secondary">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        <span
          className={
            "relative h-6 w-10 rounded-full transition-colors " +
            (checked ? "" : "bg-secondary")
          }
          style={checked ? { background: "var(--gradient-ke)" } : undefined}
          aria-hidden="true"
        >
          <span
            className={
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform " +
              (checked ? "translate-x-4" : "translate-x-0.5")
            }
          />
        </span>
      </button>
    </li>
  );
}
