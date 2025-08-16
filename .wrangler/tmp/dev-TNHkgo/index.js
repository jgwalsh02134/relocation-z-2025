var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.ts
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    try {
      if (pathname === "/api/chat" && request.method === "POST") {
        return chatHandler(request, env);
      }
      if (pathname.startsWith("/api/comps") && request.method === "GET") {
        return compsHandler(request, env);
      }
      if (pathname.startsWith("/api/listings") && request.method === "GET") {
        return listingsHandler(request, env);
      }
      return env.ASSETS.fetch(request);
    } catch (err) {
      return json({ error: err?.message ?? "Unhandled error" }, 500);
    }
  }
};
function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders }
  });
}
__name(json, "json");
function n(v, def = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
}
__name(n, "n");
async function zfetch(url, env) {
  const r = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": env.RAPIDAPI_HOST
    }
  });
  if (!r.ok) throw new Error(`Zillow API ${r.status}: ${await r.text()}`);
  return r.json();
}
__name(zfetch, "zfetch");
async function chatHandler(request, env) {
  const body = await request.json();
  const { messages = [], meta = {} } = body || {};
  const systemPrompt = "You are Lenny Lodge \u2014 a professional, sharp, and friendly beaver who guides a single homeowner through a relocation. Keep answers concise (1\u20133 short paragraphs), with light, uplifting humor (never sarcastic). Never mention personal circumstances or speculate about emotions; focus on data, steps, and practical suggestions. Use the provided context to be specific.";
  const sys = { role: "system", content: systemPrompt };
  const ctx = { role: "system", content: `Context: ${JSON.stringify(meta)}` };
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.3,
      messages: [sys, ctx, ...messages]
    })
  });
  if (!upstream.ok || !upstream.body) {
    return json({ error: await upstream.text() }, 502);
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
__name(chatHandler, "chatHandler");
async function compsHandler(request, env) {
  const addr = new URL(request.url).searchParams.get("address") || "";
  if (!addr) return json({ error: "Missing address" }, 400);
  const FIND = env.ZILLOW_FIND_PATH || "/search";
  const COMPS = env.ZILLOW_COMPS_PATH || "/propertyComps";
  const findQS = new URLSearchParams({ q: addr, location: addr, limit: "1" }).toString();
  const j1 = await zfetch(`https://${env.RAPIDAPI_HOST}${FIND}?${findQS}`, env);
  const first = j1?.data?.results?.[0] || j1?.data?.[0] || j1?.result?.[0] || j1?.results?.[0] || j1?.props?.[0];
  const zpid = first?.zpid ?? first?.property?.zpid ?? first?.id;
  if (!zpid) return json({ error: "No ZPID for that address" }, 404);
  const compsQS = new URLSearchParams({ zpid: String(zpid), limit: "25" }).toString();
  const j2 = await zfetch(`https://${env.RAPIDAPI_HOST}${COMPS}?${compsQS}`, env);
  const comps = j2?.data?.comparables ?? j2?.data?.comps ?? j2?.comparables ?? j2?.comps ?? [];
  const prices = (Array.isArray(comps) ? comps : []).map((c) => n(c.price ?? c.listPrice ?? c.soldPrice ?? c.zestimate)).filter((x) => x > 0).sort((a, b) => a - b);
  const p10 = prices[Math.floor(prices.length * 0.1)] ?? 45e4;
  const p90 = prices[Math.floor(prices.length * 0.9)] ?? 55e4;
  const mid = (p10 + p90) / 2;
  const taxes = Math.round(mid * 0.012);
  const utilities = 350;
  return json({ low: p10, high: p90, taxes, utilities }, 200, {
    "Cache-Control": "public, max-age=600"
  });
}
__name(compsHandler, "compsHandler");
async function listingsHandler(request, env) {
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
    limit: "25"
  }).toString();
  const j = await zfetch(`https://${env.RAPIDAPI_HOST}${LIST}?${qs}`, env);
  const arr = j?.data?.results || j?.data || j?.result || [];
  const listings = (Array.isArray(arr) ? arr : []).slice(0, 25).map((p, i) => ({
    id: String(p.zpid ?? p.id ?? i),
    address: p.address ?? p.formattedAddress ?? [p.streetAddress, p.city, p.state, p.zipcode].filter(Boolean).join(", "),
    price: n(p.price ?? p.listPrice ?? p.zestimate, 0),
    beds: p.beds ?? p.bedrooms,
    baths: p.baths ?? p.bathrooms,
    url: p.detailUrl ?? p.url
  }));
  return json({ listings });
}
__name(listingsHandler, "listingsHandler");

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-scheduled.ts
var scheduled = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  const url = new URL(request.url);
  if (url.pathname === "/__scheduled") {
    const cron = url.searchParams.get("cron") ?? "";
    await middlewareCtx.dispatch("scheduled", { cron });
    return new Response("Ran scheduled event");
  }
  const resp = await middlewareCtx.next(request, env);
  if (request.headers.get("referer")?.endsWith("/__scheduled") && url.pathname === "/favicon.ico" && resp.status === 500) {
    return new Response(null, { status: 404 });
  }
  return resp;
}, "scheduled");
var middleware_scheduled_default = scheduled;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oAxcFO/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_scheduled_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oAxcFO/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
