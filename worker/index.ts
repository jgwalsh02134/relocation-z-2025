// worker/index.ts
// One Worker that serves static assets and handles /api/* routes.
// Uses Zillow (RapidAPI) + OpenAI for Lenny Lodge chat.

export interface Env {
  // Secrets / vars (add these in Cloudflare + .dev.vars)
  OPENAI_API_KEY: string;

  RAPIDAPI_KEY: string;
  RAPIDAPI_HOST: string;            // e.g. zillow56.p.rapidapi.com
  ZILLOW_FIND_PATH?: string;        // default: /search
  ZILLOW_COMPS_PATH?: string;       // default: /propertyComps
  ZILLOW_LIST_PATH?: string;        // default: /propertyExtendedSearch

  // Static assets binding (configured in wrangler.toml)
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      // ---- API routing -------------------------------------------------------
      if (pathname === "/api/chat" && request.method === "POST") {
        return chatHandler(request, env);
      }
      if (pathname.startsWith("/api/comps") && request.method === "GET") {
        return compsHandler(request, env);
      }
      if (pathname.startsWith("/api/listings") && request.method === "GET") {
        return listingsHandler(request, env);
      }

      // ---- Static assets / SPA fallback -------------------------------------
      // Let the Assets binding serve files from web/dist; wrangler.toml sets SPA fallback.
      return env.ASSETS.fetch(request) as Promise<Response>;
    } catch (err: any) {
      return json({ error: err?.message ?? "Unhandled error" }, 500);
    }
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function n(v: unknown, def = 0): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
}

async function zfetch(url: string, env: Env) {
  const r = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": env.RAPIDAPI_HOST,
    },
  });
  if (!r.ok) throw new Error(`Zillow API ${r.status}: ${await r.text()}`);
  return r.json();
}

// ---------------------------------------------------------------------------
// /api/chat  (OpenAI streaming; Lenny persona)
// ---------------------------------------------------------------------------
async function chatHandler(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as any;
  const { messages = [], meta = {} } = body || {};

  const systemPrompt =
    "You are Lenny Lodge — a professional, sharp, and friendly beaver who guides a single homeowner through a relocation. " +
    "Keep answers concise (1–3 short paragraphs), with light, uplifting humor (never sarcastic). " +
    "Never mention personal circumstances or speculate about emotions; focus on data, steps, and practical suggestions. " +
    "Use the provided context to be specific.";

  const sys = { role: "system", content: systemPrompt };
  const ctx = { role: "system", content: `Context: ${JSON.stringify(meta)}` };

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
      messages: [sys, ctx, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return json({ error: await upstream.text() }, 502);
  }

  // Pass through OpenAI's SSE stream
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// ---------------------------------------------------------------------------
/* /api/comps  (address -> zpid -> comps -> {low, high, taxes, utilities}) */
// ---------------------------------------------------------------------------
async function compsHandler(request: Request, env: Env): Promise<Response> {
  const addr = new URL(request.url).searchParams.get("address") || "";
  if (!addr) return json({ error: "Missing address" }, 400);

  const FIND = env.ZILLOW_FIND_PATH || "/search";
  const COMPS = env.ZILLOW_COMPS_PATH || "/propertyComps";

  // 1) address -> zpid
  const findQS = new URLSearchParams({ q: addr, location: addr, limit: "1" }).toString();
  const j1 = await zfetch(`https://${env.RAPIDAPI_HOST}${FIND}?${findQS}`, env);
  const first =
    j1?.data?.results?.[0] ||
    j1?.data?.[0] ||
    j1?.result?.[0] ||
    j1?.results?.[0] ||
    j1?.props?.[0];
  const zpid = first?.zpid ?? first?.property?.zpid ?? first?.id;
  if (!zpid) return json({ error: "No ZPID for that address" }, 404);

  // 2) zpid -> comps
  const compsQS = new URLSearchParams({ zpid: String(zpid), limit: "25" }).toString();
  const j2 = await zfetch(`https://${env.RAPIDAPI_HOST}${COMPS}?${compsQS}`, env);
  const comps =
    j2?.data?.comparables ??
    j2?.data?.comps ??
    j2?.comparables ??
    j2?.comps ??
    [];

  const prices = (Array.isArray(comps) ? comps : [])
    .map((c: any) => n(c.price ?? c.listPrice ?? c.soldPrice ?? c.zestimate))
    .filter((x) => x > 0)
    .sort((a, b) => a - b);

  const p10 = prices[Math.floor(prices.length * 0.1)] ?? 450000;
  const p90 = prices[Math.floor(prices.length * 0.9)] ?? 550000;

  const mid = (p10 + p90) / 2;
  const taxes = Math.round(mid * 0.012); // light heuristic, UI can override
  const utilities = 350;                  // light heuristic

  return json({ low: p10, high: p90, taxes, utilities }, 200, {
    "Cache-Control": "public, max-age=600",
  });
}

// ---------------------------------------------------------------------------
// /api/listings  (city/zip + price band -> normalized listings[])
// ---------------------------------------------------------------------------
async function listingsHandler(request: Request, env: Env): Promise<Response> {
  const u = new URL(request.url);
  const city = u.searchParams.get("city") || "";
  const state = u.searchParams.get("state") || "NY";
  const zip = u.searchParams.get("zip") || "";
  const min = u.searchParams.get("min") || "400000";
  const max = u.searchParams.get("max") || "550000";

  const LIST = env.ZILLOW_LIST_PATH || "/propertyExtendedSearch";
  const qs = new URLSearchParams({
    city,
    state,
    zip,
    min,
    max,
    limit: "25",
  }).toString();

  const j = await zfetch(`https://${env.RAPIDAPI_HOST}${LIST}?${qs}`, env);
  const arr = j?.data?.results || j?.data || j?.result || [];

  const listings = (Array.isArray(arr) ? arr : []).slice(0, 25).map((p: any, i: number) => ({
    id: String(p.zpid ?? p.id ?? i),
    address:
      p.address ??
      p.formattedAddress ??
      [p.streetAddress, p.city, p.state, p.zipcode].filter(Boolean).join(", "),
    price: n(p.price ?? p.listPrice ?? p.zestimate, 0),
    beds: p.beds ?? p.bedrooms,
    baths: p.baths ?? p.bathrooms,
    url: p.detailUrl ?? p.url,
  }));

  return json({ listings });
}


