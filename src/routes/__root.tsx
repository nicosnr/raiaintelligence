import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, BookOpen, MessagesSquare, Landmark, Search, Play, LayoutGrid } from "lucide-react";

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
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/representatives", label: "Reps", icon: Landmark },
  { to: "/glossary", label: "Glossary", icon: Search },
  { to: "/assistant", label: "Ask", icon: MessagesSquare },
] as const;

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none sticky bottom-3 left-0 right-0 z-20 mt-3 flex justify-center px-4"
    >
      <ul
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/95 px-2 py-1.5 backdrop-blur"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className:
                  "bg-accent text-accent-foreground gap-1.5 px-3.5",
              }}
              inactiveProps={{ className: "text-muted-foreground gap-0 px-2.5" }}
              className="group flex h-10 items-center justify-center rounded-full text-[12px] font-medium transition-all"
              aria-label={label}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span className="hidden whitespace-nowrap group-aria-[current=page]:inline">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-frame flex flex-col">
        <main className="flex-1 pb-2">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
}
