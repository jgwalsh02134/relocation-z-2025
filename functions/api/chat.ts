/// <reference types="@cloudflare/workers-types" />
export const onRequestPost: PagesFunction<{ OPENAI_API_KEY: string }> = async ({ request, env }) => {
  const { messages = [], meta = {} } = (await request.json()) as any;
  const sys = { role: "system", content:
    "You are Lenny Lodge — sharp, smart, professional, lightly witty. " +
    "Guide step-by-step, keep answers concise, never mention personal circumstances. " +
    "Focus on data, actions, and the user’s current selections." };
  const ctx = { role: "system", content: `Context: ${JSON.stringify(meta)}` };

  // Fallback when no OPENAI_API_KEY is configured
  if (!env.OPENAI_API_KEY) {
    const reply = "Hi! I’m Lenny. I don’t have my AI key set up yet, but I can still help: check the Overview for ranges and try the Start with Sale flow.";
    return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", stream: true, temperature: 0.3, messages: [sys, ctx, ...messages] })
  });
  if (!upstream.ok || !upstream.body) return new Response(JSON.stringify({ error: await upstream.text() }), { status: 502 });
  return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream" }});
};


