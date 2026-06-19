import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CivicIntel" },
      { name: "description", content: "Your CivicIntel account." },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  national_id: string | null;
  phone: string | null;
};

function ProfilePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(u.user.email ?? null);
      setEmailVerified(!!u.user.email_confirmed_at);
      const { data: p } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, national_id, phone")
        .eq("id", u.user.id)
        .maybeSingle();
      if (p) {
        setProfile(p as Profile);
        setName(p.display_name ?? "");
        setNationalId((p as Profile).national_id ?? "");
        setPhone((p as Profile).phone ?? "");
      }
    })();
  }, [navigate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setStatus(null);
    const idTrim = nationalId.trim();
    const phoneTrim = phone.trim();
    if (idTrim && !/^\d{6,10}$/.test(idTrim)) {
      setBusy(false);
      setStatus("National ID must be 6–10 digits.");
      return;
    }
    if (phoneTrim && !/^\+?\d{7,15}$/.test(phoneTrim)) {
      setBusy(false);
      setStatus("Phone must be digits, optional leading +.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: name,
        national_id: idTrim || null,
        phone: phoneTrim || null,
      })
      .eq("id", profile.id);
    setBusy(false);
    setStatus(error ? error.message : "Saved.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (!profile) {
    return (
      <div className="px-5 pt-16 text-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  const initials = (name || profile.display_name || email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="pb-24">
      <PageHeader eyebrow="Account" title="Your profile" description="Manage your display name and session." />

      <div className="mx-4 flex items-center gap-3 rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div
          className="ke-ring flex size-14 items-center justify-center rounded-full font-bold text-white"
          style={{ background: "var(--gradient-ke)" }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-serif text-lg leading-tight">{profile.display_name ?? "Civic learner"}</p>
          <p className="text-[12px] text-muted-foreground">{email}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {emailVerified ? "✓ Gmail verified" : "Email pending"}
          </p>
        </div>
      </div>

      <form onSubmit={save} className="mx-4 mt-4 space-y-3 rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <Field label="Display name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </Field>
        <Field label="National ID" hint="6–10 digits. Used to verify you're a unique voter.">
          <input
            inputMode="numeric"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 33445566"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </Field>
        <Field label="Phone number" hint="Used for civic alerts. SMS verification coming soon.">
          <input
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2547XXXXXXXX"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="tap w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--gradient-ke)" }}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {status && <p className="text-[11px] text-muted-foreground">{status}</p>}
      </form>

      <ul className="mx-4 mt-4 space-y-2">
        <ProfileLink to="/voting" icon={<Sparkles className="size-4" />} label="Subjects of matter" />


      <form onSubmit={save} className="mx-4 mt-4 space-y-2 rounded-3xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <label htmlFor="dname" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Display name
        </label>
        <input
          id="dname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={busy}
          className="tap w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--gradient-ke)" }}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {status && <p className="text-[11px] text-muted-foreground">{status}</p>}
      </form>

      <ul className="mx-4 mt-4 space-y-2">
        <ProfileLink to="/polls" icon={<Sparkles className="size-4" />} label="Civic polls" />
        <ProfileLink to="/settings" icon={<Settings className="size-4" />} label="Settings" />
        <li>
          <Link to="/agents/sentinel" className="tap flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <ShieldCheck className="size-4 text-[color:var(--ke-red)]" /> Open Sentinel AI
          </Link>
        </li>
        <li>
          <button onClick={signOut} className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-destructive">
            <LogOut className="size-4" /> Sign out
          </button>
        </li>
      </ul>
    </div>
  );
}

function ProfileLink({ to, icon, label }: { to: "/polls" | "/settings"; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link to={to} className="tap flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
        {icon} {label}
      </Link>
    </li>
  );
}
