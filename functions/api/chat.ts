export const onRequestPost: PagesFunction<{ OPENAI_API_KEY: string }> = async ({ request, env }) => {
  const { messages = [], meta = {} } = await request.json<any>();
  const sys = { role: "system", content:
    "You are Lenny Lodge — sharp, smart, professional, lightly witty. " +
    "Guide step-by-step, keep answers concise, never mention personal circumstances. " +
    "Focus on data, actions, and the user’s current selections." };
  const ctx = { role: "system", content: `Context: ${JSON.stringify(meta)}` };

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", stream: true, temperature: 0.3, messages: [sys, ctx, ...messages] })
  });
  if (!upstream.ok || !upstream.body) return new Response(JSON.stringify({ error: await upstream.text() }), { status: 502 });
  return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream" }});
};


