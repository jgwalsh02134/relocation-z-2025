/// <reference types="@cloudflare/workers-types" />
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
  if (!env.RAPIDAPI_KEY || !env.RAPIDAPI_HOST) {
    const listings = [
      { id: "sim-1", address: "8 Loudonwood E, Loudonville, NY 12211", price: 449900, beds: 3, baths: 3, url: "https://www.zillow.com/homedetails/8-Loudonwood-E-Loudonville-NY-12211/29697778_zpid/" },
      { id: "sim-2", address: "100 ABC Ln, Colonie, NY 12205", price: 475000, beds: 4, baths: 2, url: "https://www.zillow.com/" },
      { id: "sim-3", address: "12 Maple Dr, Colonie, NY 12205", price: 520000, beds: 4, baths: 3, url: "https://www.zillow.com/" }
    ];
    return new Response(JSON.stringify({ listings }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" }});
  }
  const PATH = env.ZILLOW_LIST_PATH || "/propertyExtendedSearch";
  try {
    const r = await fetch(`https://${env.RAPIDAPI_HOST}${PATH}?${qs}`, {
      headers: { "X-RapidAPI-Key": env.RAPIDAPI_KEY, "X-RapidAPI-Host": env.RAPIDAPI_HOST }
    });
    const j: any = await r.json();
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
  } catch (e) {
    const listings = [
      { id: "sim-1", address: "8 Loudonwood E, Loudonville, NY 12211", price: 449900, beds: 3, baths: 3, url: "https://www.zillow.com/homedetails/8-Loudonwood-E-Loudonville-NY-12211/29697778_zpid/" }
    ];
    return new Response(JSON.stringify({ listings }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" }});
  }
};


