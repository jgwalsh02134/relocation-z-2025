export const onRequestGet: PagesFunction<{
  RAPIDAPI_KEY: string; RAPIDAPI_HOST: string; ZILLOW_LIST_PATH?: string;
}> = async ({ request, env }) => {
  const u = new URL(request.url);
  const qs = new URLSearchParams({
    city: u.searchParams.get("city") || "Loudonville",
    state: u.searchParams.get("state") || "NY",
    min: u.searchParams.get("min") || "400000",
    max: u.searchParams.get("max") || "550000",
    limit: "25"
  });
  const PATH = env.ZILLOW_LIST_PATH || "/propertyExtendedSearch";
  const r = await fetch(`https://${env.RAPIDAPI_HOST}${PATH}?${qs}`, {
    headers: { "X-RapidAPI-Key": env.RAPIDAPI_KEY, "X-RapidAPI-Host": env.RAPIDAPI_HOST }
  });
  const j = await r.json();
  const arr = j?.data?.results || j?.data || j?.result || [];
  const listings = (Array.isArray(arr) ? arr : []).slice(0, 25).map((p: any, i: number) => ({
    id: String(p.zpid || p.id || i),
    address: p.address || p.formattedAddress,
    price: Number(p.price || p.zestimate || 0),
    beds: p.beds || p.bedrooms,
    baths: p.baths || p.bathrooms,
    url: p.detailUrl || p.url
  }));
  return new Response(JSON.stringify({ listings }), { headers: { "Content-Type": "application/json" }});
};


