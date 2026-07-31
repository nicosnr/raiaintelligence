import { Capacitor } from "@capacitor/core";
import { getAssistantApiUrl } from "@/lib/api-base";
import type { AssistantInput } from "@/lib/assistant.types";
import { supabase } from "@/integrations/supabase/client";

export type { AssistantInput };

export async function askAssistantClient(data: AssistantInput): Promise<{ reply: string }> {
  if (Capacitor.isNativePlatform() && !import.meta.env.VITE_SERVER_BASE_URL) {
    throw new Error(
      "Mobile app is not configured. Rebuild with VITE_SERVER_BASE_URL set to your deployed CivicIntel URL.",
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(getAssistantApiUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const json = (await res.json().catch(() => null)) as { reply?: string; error?: string } | null;

  if (!res.ok) {
    throw new Error(json?.error ?? "The assistant couldn't respond. Please try again.");
  }

  if (!json?.reply) {
    throw new Error("Empty response from the assistant.");
  }

  return { reply: json.reply };
}
