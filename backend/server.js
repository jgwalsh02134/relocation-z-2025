import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';

dotenv.config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/comps', async (req, res) => {
  const address = req.query.address;
  if (!address) return res.status(400).json({ error: 'Address required' });

  try {
    const [zillow, redfin, realtor] = await Promise.allSettled([
      fetchZillow(address),
      fetchRedfin(address),
      fetchRealtor(address)
    ]);
    const sources = [zillow, redfin, realtor]
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);
    if (!sources.length) return res.status(502).json({ error: 'No sources returned data' });
    return res.json(mergeSources(sources));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch comps' });
  }
});

// Simple chat proxy to OpenAI for Lenny Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const persona = `You are Lenny Lodge, a friendly, informed relocation assistant (a beaver mascot). 
Speak concisely and clearly. Default to helpful, practical next steps. 
Use the provided context (selling address, prospect, sale/buy ranges, net proceeds, cash to close, PITI) to give specific guidance. 
Avoid legal/financial advice disclaimers unless necessary. Encourage informed decision-making.`;

    const userContent = [
      `User: ${String(message)}`,
      '--- Context ---',
      context ? JSON.stringify(context).slice(0, 6000) : '(none)'
    ].join('\n');

    const payload = {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: persona },
        { role: 'user', content: userContent }
      ]
    };

    const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 20000
    });
    const reply = resp.data?.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (e) {
    console.error('Chat error', e?.response?.data || e.message);
    return res.status(500).json({ error: 'Chat failed' });
  }
});

function mergeSources(sources) {
  const median = arr => {
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };
  const lows = sources.map(s => s.low).filter(Number.isFinite);
  const highs = sources.map(s => s.high).filter(Number.isFinite);
  const taxes = sources.map(s => s.taxes).filter(Number.isFinite);
  const utils = sources.map(s => s.utilities).filter(Number.isFinite);
  return {
    low: lows.length ? Math.round(median(lows)) : null,
    high: highs.length ? Math.round(median(highs)) : null,
    taxes: taxes.length ? Math.round(median(taxes)) : null,
    utilities: utils.length ? Math.round(median(utils)) : null
  };
}

// Zillow
async function fetchZillow(address) {
  if (!process.env.ZWSID) return null;
  const url = `https://api.zillow.com/webservice/GetSearchResults.htm?address=${encodeURIComponent(address)}&citystatezip=&rentzestimate=false&zws-id=${process.env.ZWSID}`;
  const xml = await axios.get(url, { timeout: 10000 }).then(r => r.data);
  const json = await parseStringPromise(xml);
  try {
    const result = json['SearchResults:searchresults']?.response?.[0]?.results?.[0]?.result?.[0];
    if (!result?.zestimate?.[0]) return null;
    const low = parseInt(result.zestimate[0].valuationRange?.[0]?.low?.[0]?._, 10);
    const high = parseInt(result.zestimate[0].valuationRange?.[0]?.high?.[0]?._, 10);
    const taxes = result.taxAssessment ? parseFloat(result.taxAssessment[0]) : null;
    if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
    return { low, high, taxes: Number.isFinite(taxes) ? taxes : null, utilities: null };
  } catch {
    return null;
  }
}

// Redfin
async function getRedfinPropertyId(address) {
  const url = `https://www.redfin.com/stingray/do/location-autocomplete?location=${encodeURIComponent(address)}`;
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
  const row = res.data?.payload?.sections?.[0]?.rows?.[0];
  return row?.id || null;
}
async function fetchRedfin(address) {
  try {
    const id = await getRedfinPropertyId(address);
    if (!id) return null;
    const url = `https://www.redfin.com/stingray/api/home/details/${id}`;
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const pr = res.data?.payload?.publicRecordsInfoV2;
    const low = pr?.estimate?.low;
    const high = pr?.estimate?.high;
    const taxes = pr?.assessment?.taxAmount;
    if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
    return { low: Math.round(low), high: Math.round(high), taxes: Number.isFinite(taxes) ? Math.round(taxes) : null, utilities: null };
  } catch {
    return null;
  }
}

// Realtor (RapidAPI)
async function fetchRealtor(address) {
  if (!process.env.RAPIDAPI_KEY) return null;
  const url = `https://realtor.p.rapidapi.com/properties/v2/list?limit=1&offset=0&address=${encodeURIComponent(address)}`;
  const res = await axios.get(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
    },
    timeout: 10000
  });
  const prop = res.data?.properties?.[0];
  if (!prop?.price) return null;
  const price = Number(prop.price);
  const low = Math.round(price * 0.95);
  const high = Math.round(price * 1.05);
  const taxes = prop.taxHistory?.[0]?.amount ? Math.round(Number(prop.taxHistory[0].amount)) : null;
  return { low, high, taxes, utilities: null };
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Lenny proxy running on :${PORT}`));
