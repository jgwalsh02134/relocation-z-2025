export const onRequestPost: PagesFunction<{ OPENAI_API_KEY: string }> = async ({ request, env }) => {
  try {
    const { messages = [], meta = {} } = await request.json<any>();

    const sys = {
      role: "system",
      content:
        "You are Lenny Lodge — a friendly, professional beaver who guides a single homeowner through a relocation. " +
        "Be concise, step-by-step, and act as the app's voice. Use subtle dry humor (beaver/lodge/building), never condescend. " +
        "Offer clear next actions and keep answers grounded in the provided context and numbers."
    } as const;

    const ctx = { role: "system", content: `Context: ${JSON.stringify(meta)}` } as const;

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
        messages: [sys, ctx, ...messages.filter((m: any) => m?.role && m?.content)]
      })
    });

    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text();
      return new Response(JSON.stringify({ error: `OpenAI error: ${txt}` }), { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Bad request" }), { status: 400 });
  }
};


