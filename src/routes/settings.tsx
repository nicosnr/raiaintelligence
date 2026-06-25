import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Shield, Scale, Database } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <div className="min-h-screen bg-background px-4 pb-32 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
      <h1 className="font-serif text-3xl italic mt-1 mb-8">Settings</h1>

      {/* Legal Section */}
      <section className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Legal & Compliance</p>
        <ul className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">

          <li>
            <Link to="/privacy-policy" className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/60">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#000,#990000 60%,#006600)" }}>
                <Shield className="size-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold leading-tight">Privacy Policy</span>
                <span className="block text-[11.5px] text-muted-foreground">How we handle your data</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>

          <li>
            <Link to="/terms-of-service" className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/60">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#000,#990000 60%,#006600)" }}>
                <FileText className="size-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold leading-tight">Terms of Service</span>
                <span className="block text-[11.5px] text-muted-foreground">Rules for using CivicIntel</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>

          <li>
            <Link to="/ip-notice" className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/60">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#000,#990000 60%,#006600)" }}>
                <Scale className="size-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold leading-tight">IP & Copyright Notice</span>
                <span className="block text-[11.5px] text-muted-foreground">Ownership and content rights</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>

          <li>
            <Link to="/data-compliance" className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/60">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(135deg,#000,#990000 60%,#006600)" }}>
                <Database className="size-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold leading-tight">Data & Compliance</span>
                <span className="block text-[11.5px] text-muted-foreground">Kenya DPA 2019 compliance</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>

        </ul>
      </section>

      {/* About */}
      <section className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">About</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card px-4 py-3.5">
          <p className="text-[14px] font-semibold">CivicIntel</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">Version 1.0.0</p>
          <p className="text-[11.5px] text-muted-foreground mt-2">Educational only — never legal advice or political commentary.</p>
        </div>
      </section>

    </div>
  );
}
