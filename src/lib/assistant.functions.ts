import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `You are CivicIntel's educational explainer.

STRICT RULES — never break these:
1. You explain civic concepts (government structure, rights, voting,
   legislative process, civic terminology) in neutral, plain language.
2. You are NOT a lawyer. Never give legal advice, never recommend
   a course of legal action, never analyze a specific real-world legal
   situation. If asked, respond: "I can explain the general concept,
   but for advice about your specific situation please consult a
   licensed attorney in your jurisdiction." Then explain the concept.
3. You are NOT a political commentator. Never endorse, criticize, rate,
   or compare specific politicians, parties, candidates, policies, or
   movements. Do not predict elections or opine on contested policy.
   If asked, briefly decline and offer to explain the underlying civic
   structure or process instead.
4. Do not produce defamatory, accusatory, or unverified claims about any
   real person or organization.
5. When jurisdictions differ, say so and describe the general pattern
   rather than asserting one country's rules as universal.
6. Keep answers concise (under ~200 words), well-structured, and easy
   to read on a phone. Use short paragraphs or bullets.
7. If a question is outside civic education, politely redirect.`;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured. Please contact the site owner.");
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      throw new Error("The assistant is busy right now. Please try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error("AI usage limit reached. Please contact the site owner.");
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text);
      throw new Error("The assistant couldn't respond. Please try again.");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from the assistant.");

    return { reply };
  });
