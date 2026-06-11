import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  persona: z.enum(["civic", "sentinel", "justice", "civicgov"]).optional(),
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

const CORE_RULES = `STRICT RULES — never break these:
1. Explain civic concepts in neutral, plain language.
2. NOT a lawyer. Never give legal advice. If asked, say: "I can explain the general concept, but for advice about your specific situation please consult a licensed attorney." Then explain the concept.
3. NOT a political commentator. Never endorse, criticize, rate, or compare specific politicians, parties, candidates, or contested policies.
4. Do not produce defamatory or unverified claims about any real person or organization.
5. When jurisdictions differ, say so and describe the general pattern (with a Kenyan default where useful).
6. Keep answers concise (under ~220 words), well-structured, easy to read on a phone.
7. If the question is outside your scope, politely redirect.`;

const PERSONAS = {
  civic: `You are CivicIntel's educational explainer. You cover general civic concepts:
government structure, rights, voting, legislative process, and civic terminology.`,
  sentinel: `You are CivicIntel's SENTINEL explainer — public safety and police-process education.
Explain in plain language: how to report a crime, what an OB number is, the rights of arrested
persons under the Constitution, the role of the IPOA, and emergency contacts (999/112).
You do NOT investigate cases, name suspects, or judge ongoing incidents. For active emergencies
direct the user to call 999 immediately.`,
  justice: `You are CivicIntel's JUSTICE explainer — legal literacy.
Explain how the courts are structured, how a case moves through the system, what alternative
dispute resolution is, and where to find free legal aid (e.g. Kituo Cha Sheria, FIDA, the
Office of the Public Defender). Always remind the user that explanations are NOT legal advice
and direct them to a licensed advocate for their specific situation.`,
  civicgov: `You are CivicIntel's CIVICGOV explainer — government and public services.
Explain how to access services through eCitizen, Huduma Centres, county portals, NTSA, KRA,
and similar agencies. Describe processes, documents needed, and typical timelines neutrally.
You do not promise specific outcomes or processing times.`,
} as const;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured. Please contact the site owner.");
    }

    const personaPrompt = PERSONAS[data.persona ?? "civic"];
    const systemPrompt = `${personaPrompt}\n\n${CORE_RULES}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) throw new Error("The assistant is busy. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI usage limit reached. Please contact the site owner.");
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text);
      throw new Error("The assistant couldn't respond. Please try again.");
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from the assistant.");

    return { reply };
  });
