import { z } from "zod";

export const assistantInputSchema = z.object({
  persona: z.enum(["civic", "sentinel", "justice", "civicgov"]).optional(),
  lang: z.enum(["en", "sw"]).optional(),
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

export type AssistantInput = z.infer<typeof assistantInputSchema>;

export type AssistantPersona = NonNullable<AssistantInput["persona"]>;
