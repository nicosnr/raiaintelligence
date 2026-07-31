import { createFileRoute } from "@tanstack/react-router";
import { runAssistant } from "@/lib/assistant-core.server";
import { assistantInputSchema } from "@/lib/assistant.types";
import { getClientIpFromRequest, resolveUserIdFromRequest } from "@/lib/auth-request.server";
import { corsHeaders, jsonWithCors } from "@/lib/cors.server";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = assistantInputSchema.parse(body);
          const userId = await resolveUserIdFromRequest(request);
          const result = await runAssistant(data, {
            userId,
            ip: getClientIpFromRequest(request),
          });
          return jsonWithCors(request, result);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Something went wrong.";
          const status = message.startsWith("RATE_LIMIT:") ? 429 : 400;
          const clean = message.startsWith("RATE_LIMIT:") ? message.slice("RATE_LIMIT:".length) : message;
          return jsonWithCors(request, { error: clean }, status);
        }
      },
    },
  },
});
