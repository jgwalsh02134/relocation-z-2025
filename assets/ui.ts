import { ADDRESSES, DEFAULTS, SCENARIO_FACTORS } from "./constants";
import { computeSaleCosts, monthlyCarrying, overlapCost } from "./calc";
import { renderGrossNetBar, renderOverlapLine } from "./charts";
import { getLennyLine } from "./lenny";

type Charts = {
  seller?: ReturnType<typeof renderGrossNetBar>;
  buyer?: ReturnType<typeof renderOverlapLine>;
};

let charts: Charts = {};

const fmtUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function getNumber(el: HTMLInputElement | null, fallback = 0): number {
  if (!el) return fallback;
  const v = parseFloat(el.value);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

function computePitiEstimate(purchasePrice: number, downPct: number): number {
  const down = purchasePrice * (downPct / 100);
  const principal = Math.max(0, purchasePrice - down);
  const annualRate = 0.065;
  const monthlyRate = annualRate / 12;
  const n = 30 * 12;
  const pi = principal > 0 ? (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : 0;
  const taxes = (purchasePrice * 0.022) / 12; // property tax ~2.2%/yr
  const insurance = (purchasePrice * 0.0035) / 12; // ~0.35%/yr
  return Math.round(pi + taxes + insurance);
}

export function initUI() {
  const hero = document.getElementById("lenny-bubble");
  if (hero) hero.textContent = getLennyLine("welcome", ADDRESSES.sell);

  // DOM handles
  const saleInput = document.getElementById('sale-price') as HTMLInputElement | null;
  const mortInput = document.getElementById('mortgage-balance') as HTMLInputElement | null;
  const buyInput = document.getElementById('purchase-price') as HTMLInputElement | null;
  const downPctInput = document.getElementById('down-payment-percent') as HTMLInputElement | null;

  const netOut = document.getElementById('net-profit');
  const pitiOut = document.getElementById('piti-estimate');

  // Initial defaults
  if (saleInput && !saleInput.value) saleInput.value = String(DEFAULTS.saleBaseValue);
  if (downPctInput && !downPctInput.value) downPctInput.value = String(Math.round(DEFAULTS.buyerDownPct * 100));

  function recalcSell() {
    const salePrice = getNumber(saleInput, DEFAULTS.saleBaseValue);
    const mortgage = getNumber(mortInput, 0);
    const { net } = computeSaleCosts(salePrice);
    const netAfterDebt = Math.max(0, net - mortgage);
    if (netOut) netOut.textContent = fmtUSD(netAfterDebt);

    // Render Gross vs Net scenarios on seller chart
    const el = document.getElementById('seller-chart') as HTMLCanvasElement | null;
    if (el) {
      charts.seller = renderGrossNetBar(el, [
        { label: 'Conservative', gross: Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.conservative), net: computeSaleCosts(Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.conservative)).net },
        { label: 'Likely',       gross: Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.likely),       net: computeSaleCosts(Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.likely)).net },
        { label: 'Optimistic',   gross: Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.optimistic),   net: computeSaleCosts(Math.round(DEFAULTS.saleBaseValue * SCENARIO_FACTORS.optimistic)).net },
      ]);
    }
  }

  function recalcBuyAndTiming() {
    const price = getNumber(buyInput, 0);
    const downPct = getNumber(downPctInput, Math.round(DEFAULTS.buyerDownPct * 100));
    const piti = computePitiEstimate(price, downPct);
    if (pitiOut) pitiOut.textContent = fmtUSD(piti);

    const monthly = monthlyCarrying(piti, DEFAULTS.utilitiesMonthly);

    // Overlap curve on buyer chart (0..90 days)
    const el = document.getElementById('buyer-chart') as HTMLCanvasElement | null;
    if (el) {
      const pts = Array.from({ length: 31 }).map((_, i) => ({ x: i * 3, y: overlapCost(i * 3, monthly) }));
      charts.buyer = renderOverlapLine(el, pts);
    }
  }

  saleInput?.addEventListener('input', recalcSell);
  mortInput?.addEventListener('input', recalcSell);
  buyInput?.addEventListener('input', recalcBuyAndTiming);
  downPctInput?.addEventListener('input', recalcBuyAndTiming);

  // Seed first render
  recalcSell();
  recalcBuyAndTiming();
}



