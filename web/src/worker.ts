export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Simple healthcheck
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, time: new Date().toISOString() });
    }

    // Echo example
    if (url.pathname === "/api/echo") {
      const isJson = request.headers.get("content-type")?.includes("application/json");
      const body = isJson ? await request.json().catch(() => ({})) : {};
      return Response.json({ method: request.method, path: url.pathname, body });
    }

    // If you want to manually serve an asset instead of the automatic Static Assets flow:
    // return env.ASSETS.fetch(request);

    // Anything else that reaches the Worker returns 404 (most SPA/asset paths won't reach here)
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler;



