export interface Env {
  OPENAI_API_KEY: string;
  RAPIDAPI_KEY: string;
  RAPIDAPI_HOST: string;
  ZILLOW_FIND_PATH?: string;
  ZILLOW_COMPS_PATH?: string;
  ZILLOW_LIST_PATH?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // ---- API routing ----
    if (url.pathname.startsWith("/api/chat") && request.method === "POST") {
      return chatHandler(request, env);
    }
    if (url.pathname.startsWith("/api/comps") && request.method === "GET") {
      return compsHandler(request, env);
    }
    if (url.pathname.startsWith("/api/listings") && request.method === "GET") {
      return listingsHandler(request, env);
    }

    // Static assets are served by the configured [assets] block.
    // Returning 404 lets the runtime handle SPA fallback automatically.
    return new Response(null, { status: 404 });
  }
};

async function chatHandler(request: Request, env: Env) {
  const { messages = [], meta = {} } = await request.json();
  const sys = {
    role: "system",
    content:
      "You are Lenny Lodge — sharp, smart, professional, lightly witty. " +
      "Guide step-by-step, keep answers concise, never mention personal circumstances. " +
      "Focus on data, actions, and the user’s current selections.",
  };
  const ctxMsg = { role: "system", content: `Context: ${JSON.stringify(meta)}` };

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.3,
      messages: [sys, ctxMsg, ...messages],
    }),
  });
  if (!upstream.ok || !upstream.body) {
    return new Response(await upstream.text(), { status: 502 });
  }
  return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream" } });
}

async function compsHandler(request: Request, env: Env) {
  const addr = new URL(request.url).searchParams.get("address") || "";
  if (!addr) return new Response(JSON.stringify({ error: "Missing address" }), { status: 400 });

  const HOST = env.RAPIDAPI_HOST;
  const FIND = env.ZILLOW_FIND_PATH || "/search";
  const COMPS = env.ZILLOW_COMPS_PATH || "/propertyComps";
  const headers = { "X-RapidAPI-Key": env.RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } as Record<string, string>;

  const q1 = new URLSearchParams({ q: addr, location: addr, limit: "1" });
  const r1 = await fetch(`https://${HOST}${FIND}?${q1}`, { headers });
  if (!r1.ok) return new Response(JSON.stringify({ error: await r1.text() }), { status: 502 });
  const j1 = await r1.json();
  const zpid = j1?.data?.results?.[0]?.zpid || j1?.result?.[0]?.zpid || j1?.props?.[0]?.zpid;
  if (!zpid) return new Response(JSON.stringify({ error: "No ZPID" }), { status: 404 });

  const q2 = new URLSearchParams({ zpid: String(zpid), limit: "25" });
  const r2 = await fetch(`https://${HOST}${COMPS}?${q2}`, { headers });
  if (!r2.ok) return new Response(JSON.stringify({ error: await r2.text() }), { status: 502 });
  const j2 = await r2.json();

  const comps = j2?.data?.comparables || j2?.comps || [];
  const prices = (Array.isArray(comps) ? comps : [])
    .map((c: any) => Number(c.price || c.listPrice || c.soldPrice || c.zestimate))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const low = prices[Math.floor(prices.length * 0.1)] ?? 450000;
  const high = prices[Math.floor(prices.length * 0.9)] ?? 550000;
  const taxes = Math.round(((low + high) / 2) * 0.012);
  const utilities = 350;

  return new Response(JSON.stringify({ low, high, taxes, utilities }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=600" },
  });
}

async function listingsHandler(request: Request, env: Env) {
  const u = new URL(request.url);
  const qs = new URLSearchParams({
    city: u.searchParams.get("city") || "Loudonville",
    state: u.searchParams.get("state") || "NY",
    min: u.searchParams.get("min") || "400000",
    max: u.searchParams.get("max") || "550000",
    limit: "25",
  });
  const PATH = env.ZILLOW_LIST_PATH || "/propertyExtendedSearch";
  const r = await fetch(`https://${env.RAPIDAPI_HOST}${PATH}?${qs}`, {
    headers: { "X-RapidAPI-Key": env.RAPIDAPI_KEY, "X-RapidAPI-Host": env.RAPIDAPI_HOST },
  });
  if (!r.ok) return new Response(JSON.stringify({ error: await r.text() }), { status: 502 });
  const j = await r.json();
  const arr = j?.data?.results || j?.data || j?.result || [];
  const listings = (Array.isArray(arr) ? arr : []).slice(0, 25).map((p: any, i: number) => ({
    id: String(p.zpid || p.id || i),
    address: p.address || p.formattedAddress,
    price: Number(p.price || p.zestimate || 0),
    beds: p.beds || p.bedrooms,
    baths: p.baths || p.bathrooms,
    url: p.detailUrl || p.url,
  }));
  return new Response(JSON.stringify({ listings }), { headers: { "Content-Type": "application/json" } });
}


