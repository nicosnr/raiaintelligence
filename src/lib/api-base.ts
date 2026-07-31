/** Deployed TanStack Start URL — required for Capacitor/Android builds. No trailing slash. */
export function getServerBaseUrl(): string {
  const url = import.meta.env.VITE_SERVER_BASE_URL as string | undefined;
  return url?.replace(/\/$/, "") ?? "";
}

export function getAssistantApiUrl(): string {
  const base = getServerBaseUrl();
  return base ? `${base}/api/assistant` : "/api/assistant";
}
