import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const AUTH_DAILY_LIMIT = 50;
const ANON_DAILY_LIMIT = 5;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function hashSessionKey(userId: string | null, ip: string): string {
  const material = userId ?? `anon:${ip}`;
  return createHash("sha256").update(material).digest("hex");
}

export async function assertAiRateLimit(userId: string | null, ip: string): Promise<void> {
  const limit = userId ? AUTH_DAILY_LIMIT : ANON_DAILY_LIMIT;
  const today = todayUtc();

  try {
    if (userId) {
      await assertLimitForUser(userId, today, limit);
      return;
    }

    const sessionHash = hashSessionKey(null, ip);
    await assertLimitForSession(sessionHash, today, limit);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("RATE_LIMIT:")) {
      throw err;
    }
    // Table or service role may be unavailable in local dev — don't block the assistant.
    console.warn("[ai-rate-limit] skipped:", err);
  }
}

async function assertLimitForUser(userId: string, today: string, limit: number) {
  const { data: row, error } = await supabaseAdmin
    .from("ai_usage")
    .select("daily_count, reset_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!row) {
    const { error: insertError } = await supabaseAdmin.from("ai_usage").insert({
      user_id: userId,
      daily_count: 1,
      reset_at: today,
    });
    if (insertError) throw insertError;
    return;
  }

  const count = row.reset_at < today ? 1 : row.daily_count + 1;
  if (row.reset_at >= today && row.daily_count >= limit) {
    throw new Error(
      "RATE_LIMIT:Daily assistant limit reached. Sign in for a higher limit, or try again tomorrow.",
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("ai_usage")
    .update({
      daily_count: count,
      reset_at: today,
    })
    .eq("user_id", userId);

  if (updateError) throw updateError;
}

async function assertLimitForSession(sessionHash: string, today: string, limit: number) {
  const { data: row, error } = await supabaseAdmin
    .from("ai_usage")
    .select("daily_count, reset_at")
    .eq("session_hash", sessionHash)
    .maybeSingle();

  if (error) throw error;

  if (!row) {
    const { error: insertError } = await supabaseAdmin.from("ai_usage").insert({
      session_hash: sessionHash,
      daily_count: 1,
      reset_at: today,
    });
    if (insertError) throw insertError;
    return;
  }

  const count = row.reset_at < today ? 1 : row.daily_count + 1;
  if (row.reset_at >= today && row.daily_count >= limit) {
    throw new Error(
      "RATE_LIMIT:Daily limit reached for guest use. Sign in for more questions, or try again tomorrow.",
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("ai_usage")
    .update({
      daily_count: count,
      reset_at: today,
    })
    .eq("session_hash", sessionHash);

  if (updateError) throw updateError;
}

export async function logAssistantQuery(opts: {
  userId: string | null;
  ip: string;
  persona: string;
  locale: string;
}): Promise<void> {
  try {
    await supabaseAdmin.from("analytics_events").insert({
      event_type: "assistant_query",
      persona: opts.persona,
      locale: opts.locale,
      session_hash: hashSessionKey(opts.userId, opts.ip),
    });
  } catch (err) {
    console.warn("[analytics] assistant_query log failed:", err);
  }
}
