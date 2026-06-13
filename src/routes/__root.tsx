import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home, BookOpen, MessagesSquare, Landmark, Search, Play, LayoutGrid,
  MoreHorizontal, X, TrendingUp, Newspaper, CalendarDays, MapPin,
  ShieldCheck, Scale, Building2, BarChart3, UserCircle, Settings, Sparkles,
  ChevronRight,
} from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeToggle } from "../components/ThemeToggle";

function NotFoundComponent() {
  return (
    <div className="app-frame flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="app-frame flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try again or return home.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a2547" },
      { title: "CivicIntel — Neutral civic knowledge" },
      {
        name: "description",
        content:
          "A non-partisan civic knowledge utility. Learn how your government works, your rights, and key civic terms.",
      },
      { name: "author", content: "CivicIntel" },
      { property: "og:title", content: "CivicIntel" },
      { property: "og:description", content: "Neutral, non-partisan civic knowledge utility." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },

    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/reels", label: "Reels", icon: Play },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/assistant", label: "Ask", icon: MessagesSquare },
] as const;

const moreItems = [
  { to: "/posts", label: "Posts", desc: "Single-column civic timeline", icon: LayoutGrid, group: "Feed" },
  { to: "/economy", label: "Economy", desc: "FX, fuel, commodities & wallet", icon: TrendingUp, group: "Civic data" },
  { to: "/calendar", label: "Calendar", desc: "Public hearings & deadlines", icon: CalendarDays, group: "Civic data" },
  { to: "/services", label: "Services", desc: "Huduma, eCitizen & county offices", icon: MapPin, group: "Civic data" },
  { to: "/representatives", label: "Representatives", desc: "MPs, MCAs and senators", icon: Landmark, group: "Civic data" },
  { to: "/glossary", label: "Glossary", desc: "Civic & legal terms explained", icon: Search, group: "Civic data" },
  { to: "/agents/sentinel", label: "Sentinel AI", desc: "Public safety guidance", icon: ShieldCheck, group: "AI agents" },
  { to: "/agents/justice", label: "Justice AI", desc: "Plain-language legal literacy", icon: Scale, group: "AI agents" },
  { to: "/agents/civicgov", label: "CivicGov AI", desc: "How to access public services", icon: Building2, group: "AI agents" },
  { to: "/polls", label: "Polls", desc: "Non-partisan community sentiment", icon: BarChart3, group: "Community" },
  { to: "/profile", label: "Profile", desc: "Your saved topics & activity", icon: UserCircle, group: "Account" },
  { to: "/settings", label: "Settings", desc: "Theme, notifications & language", icon: Settings, group: "Account" },
] as const;

function BottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none sticky bottom-3 left-0 right-0 z-20 mt-3 flex justify-center px-3"
    >
      <ul
        className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-border bg-background/90 px-1.5 py-1.5 backdrop-blur"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="shrink-0">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "ke-gradient text-white gap-1.5 px-3" }}
              inactiveProps={{ className: "text-muted-foreground gap-0 px-2.5 hover:text-foreground" }}
              className="group flex h-9 items-center justify-center rounded-full text-[11px] font-medium transition-all"
              aria-label={label}
            >
              <Icon className="size-[16px]" aria-hidden="true" />
              <span className="hidden whitespace-nowrap group-aria-[current=page]:inline">{label}</span>
            </Link>
          </li>
        ))}
        <li className="shrink-0">
          <button
            type="button"
            onClick={onOpenMore}
            aria-label="More"
            className="tap flex h-9 items-center justify-center rounded-full px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-[16px]" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const groups = Array.from(new Set(moreItems.map((i) => i.group)));
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up"
      />
      <div
        role="dialog"
        aria-label="More navigation"
        className="relative z-10 max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl border-t border-border bg-background animate-fade-up"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="mr-1 block h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
          </div>
          <p className="absolute left-1/2 top-4 -translate-x-1/2 font-serif text-lg italic">Explore</p>
          <button onClick={onClose} aria-label="Close" className="tap rounded-full bg-secondary p-2">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          {groups.map((g) => (
            <section key={g} className="mb-5 last:mb-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
                <span className="text-[11px] text-muted-foreground">
                  {moreItems.filter((i) => i.group === g).length}
                </span>
              </div>
              <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                {moreItems.filter((i) => i.group === g).map(({ to, label, desc, icon: Icon }, idx, arr) => (
                  <li key={to} className={idx < arr.length - 1 ? "border-b border-border" : ""}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className="tap flex items-center gap-3 px-3 py-3 active:bg-secondary/60"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ background: "var(--gradient-ke, linear-gradient(135deg,#000,#990000 60%,#006600))" }}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] font-semibold leading-tight">{label}</span>
                        <span className="block truncate text-[11.5px] text-muted-foreground">{desc}</span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="px-1 pt-1 text-[10.5px] text-muted-foreground">
            CivicIntel is educational only — never legal advice or political commentary.
          </p>
        </div>
      </div>
    </div>
  );
}



function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => { setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem("ci-onboarded");
      if (!seen && pathname !== "/onboarding" && pathname !== "/auth") {
        router.navigate({ to: "/onboarding" });
      }
    } catch {}
  }, [pathname, router]);

  const isImmersive = pathname === "/onboarding" || pathname === "/reels";
  const isAssistant = pathname === "/assistant" || pathname.startsWith("/agents/");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-frame flex flex-col">
        {!isImmersive && <ThemeToggle />}
        <main key={pathname} className="flex-1 animate-fade-up pb-2">
          <Outlet />
        </main>
        {!isImmersive && !isAssistant && (
          <Link
            to="/assistant"
            aria-label="Ask CivicIntel AI"
            className="tap fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white ring-1 ring-white/15 transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#000 0%,#990000 55%,#006600 100%)",
              boxShadow: "0 14px 32px -10px rgba(153,0,0,.55), 0 8px 20px -8px rgba(0,102,0,.45)",
            }}
          >
            <Sparkles className="size-5" />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/10 animate-pulse" />
          </Link>
        )}
        {pathname !== "/onboarding" && <BottomNav onOpenMore={() => setMoreOpen(true)} />}
        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    </QueryClientProvider>
  );
}

