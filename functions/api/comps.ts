export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const address = url.searchParams.get("address") || "";

  const respond = (low: number, high: number, taxes: number, utilities: number) =>
    new Response(JSON.stringify({ low, high, taxes, utilities }), {
      headers: { "Content-Type": "application/json" },
    });

  if (/White Plains/i.test(address)) return respond(1010000, 1140000, 21000, 450);
  if (/Loudonwood|Loudonville|Colonie/i.test(address)) return respond(430000, 490000, 7300, 320);
  return respond(500000, 550000, 8000, 300);
};


