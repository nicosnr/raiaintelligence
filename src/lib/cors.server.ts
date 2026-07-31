const ALLOWED_ORIGINS = new Set([
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (origin.startsWith("http://192.168.") || origin.startsWith("http://10.")) return true;
  const extra = process.env.CORS_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
  return extra.includes(origin);
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

export function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function jsonWithCors(request: Request, body: unknown, status = 200): Response {
  return withCors(
    Response.json(body, { status }),
    request,
  );
}
