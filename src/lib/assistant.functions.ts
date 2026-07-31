import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { runAssistant } from "@/lib/assistant-core.server";
import { assistantInputSchema } from "@/lib/assistant.types";
import { getClientIp, optionalSupabaseAuth } from "@/lib/optional-auth.middleware";

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((data: unknown) => assistantInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const request = getRequest();
    return runAssistant(data, {
      userId: context?.userId ?? null,
      ip: getClientIp(request),
    });
  });
