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
  { to: "/posts", label: "Posts", icon: LayoutGrid, group: "Feed" },
  { to: "/economy", label: "Economy", icon: TrendingUp, group: "Civic data" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, group: "Civic data" },
  { to: "/services", label: "Services", icon: MapPin, group: "Civic data" },
  { to: "/representatives", label: "Reps", icon: Landmark, group: "Civic data" },
  { to: "/glossary", label: "Glossary", icon: Search, group: "Civic data" },
  { to: "/agents/sentinel", label: "Sentinel", icon: ShieldCheck, group: "AI agents" },
  { to: "/agents/justice", label: "Justice", icon: Scale, group: "AI agents" },
  { to: "/agents/civicgov", label: "CivicGov", icon: Building2, group: "AI agents" },
  { to: "/polls", label: "Polls", icon: BarChart3, group: "Community" },
  { to: "/profile", label: "Profile", icon: UserCircle, group: "Account" },
  { to: "/settings", label: "Settings", icon: Settings, group: "Account" },
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
        className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-up"
      />
      <div
        role="dialog"
        aria-label="More navigation"
        className="relative z-10 w-full max-w-[480px] rounded-t-3xl border-t border-border bg-background p-5 animate-fade-up"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-serif text-xl">Explore CivicIntel</p>
          <button onClick={onClose} aria-label="Close" className="tap rounded-full bg-secondary p-2">
            <X className="size-4" />
          </button>
        </div>
        {groups.map((g) => (
          <div key={g} className="mb-4 last:mb-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
            <ul className="grid grid-cols-3 gap-2">
              {moreItems.filter((i) => i.group === g).map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onClose}
                    className="tap flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3 text-center text-[11px] font-semibold"
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-full text-white"
                      style={{ background: "var(--gradient-ke)" }}
                    >
                      <Icon className="size-[16px]" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-frame flex flex-col">
        {!isImmersive && <ThemeToggle />}
        <main key={pathname} className="flex-1 animate-fade-up pb-2">
          <Outlet />
        </main>
        {pathname !== "/onboarding" && <BottomNav onOpenMore={() => setMoreOpen(true)} />}
        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    </QueryClientProvider>
  );
}

