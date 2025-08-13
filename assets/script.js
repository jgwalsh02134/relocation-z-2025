// Example Data
const sellingProperty = {
    address: "54 Collyer Pl, White Plains, NY 10605",
    price: 600000,
    taxes: 14500,
    insurance: 1800,
    utilities: 3200
};

const buyingProperties = [
    {
        id: 1,
        address: "123 Maple Ave, Colonie, NY",
        price: 425000,
        taxes: 6800,
        insurance: 1600,
        utilities: 2900
    },
    {
        id: 2,
        address: "456 Oak St, Albany, NY",
        price: 390000,
        taxes: 6200,
        insurance: 1500,
        utilities: 2800
    }
];

// Populate selector
const buySelect = document.getElementById("buyPropertySelect");
buyingProperties.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.address;
    buySelect.appendChild(opt);
});

// Update Dashboard
function updateDashboard() {
    const selectedId = parseInt(buySelect.value);
    const buyProp = buyingProperties.find(p => p.id === selectedId);

    document.getElementById("sellPrice").textContent = `$${sellingProperty.price.toLocaleString()}`;
    document.getElementById("buyPrice").textContent = `$${buyProp.price.toLocaleString()}`;

    const net = sellingProperty.price - buyProp.price;
    const netElem = document.getElementById("netDifference");
    netElem.textContent = `$${net.toLocaleString()}`;
    netElem.className = "metric-value " + (net >= 0 ? "metric-positive" : "metric-negative");

    // Property Details
    const detailsEl = document.getElementById("propertyDetails");
    if (detailsEl) detailsEl.innerHTML = `
        <h3>Selling</h3>
        <p>${sellingProperty.address}</p>
        <ul>
            <li>Taxes: $${sellingProperty.taxes.toLocaleString()}</li>
            <li>Insurance: $${sellingProperty.insurance.toLocaleString()}</li>
            <li>Utilities: $${sellingProperty.utilities.toLocaleString()}</li>
        </ul>
        <h3>Buying</h3>
        <p>${buyProp.address}</p>
        <ul>
            <li>Taxes: $${buyProp.taxes.toLocaleString()}</li>
            <li>Insurance: $${buyProp.insurance.toLocaleString()}</li>
            <li>Utilities: $${buyProp.utilities.toLocaleString()}</li>
        </ul>
    `;

    // Update Chart
    costChart.data.datasets[0].data = [
        sellingProperty.taxes, buyProp.taxes,
        sellingProperty.insurance, buyProp.insurance,
        sellingProperty.utilities, buyProp.utilities
    ];
    costChart.update();
}

// Chart.js
const ctx = document.getElementById('costChart').getContext('2d');
const costChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            'Taxes (Sell)', 'Taxes (Buy)',
            'Insurance (Sell)', 'Insurance (Buy)',
            'Utilities (Sell)', 'Utilities (Buy)'
        ],
        datasets: [{
            label: 'Annual Costs ($)',
            data: [],
            backgroundColor: '#007bff'
        }]
    },
    options: { 
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 0
                }
            }
        }
    }
});

// Event listener
buySelect.addEventListener("change", updateDashboard);

// Init
buySelect.value = buyingProperties[0].id;
updateDashboard();

// ----- SELLING (authoritative baseline for 54 Collyer Pl) -----
const SELLING = {
  address: "54 Collyer Pl, White Plains, NY 10605",
  baseValue: 600000,                 // from valuation.point_estimate
  commissionRate: 0.04,              // closing_costs.commission_rate
  transferTaxRate: 0.004,            // NYS seller transfer tax (0.4%)
  attorneyFee: 2200,
  stagingPhotography: 3000,
  miscClosing: 1500,
  meta: {
    beds: 3,
    baths: 1.5,
    sqft: 1065,
    lot_sqft: 13068,
    year_built: 1924,
    zoning: "R1-7.5",
    features: ["Cape Cod style", "Basement"]
  },
  costs: {
    taxes_annual: 11119.27,
    insurance_annual: 1600,
    utilities_monthly_breakdown: {
      electric: 150,
      gas: 140,
      water_sewer: 30,
      internet: 70,
      other: 0
    },
    utilities_monthly_total: 390
  },
  sources: {
    valuation: [
      { name: "Redfin – subject property record", url: "https://www.redfin.com/NY/White-Plains/54-Collyer-Pl-10605/home/20181781" },
      { name: "Zillow – subject property page", url: "https://www.zillow.com/homedetails/54-Collyer-Pl-White-Plains-NY-10605/32982800_zpid/" },
      { name: "PropertyShark – public record", url: "https://www.propertyshark.com/mason/Property/9171955/54-Collyer-Pl-White-Plains-NY-10605/" },
      { name: "City of White Plains – 2025 Final Assessment Roll (PDF)", url: "https://www.cityofwhiteplains.com/DocumentCenter/View/16387/2025-Final-Assessment-Roll" }
    ],
    taxes: "https://www.cityofwhiteplains.com/DocumentCenter/View/16387/2025-Final-Assessment-Roll",
    insurance: "https://www.policygenius.com/homeowners-insurance/new-york/",
    utilities: [
      { name: "City of White Plains – Water & Sewer Rates", url: "https://www.cityofwhiteplains.com/FAQ.aspx?TID=19" },
      { name: "Verizon Fios – plan/pricing reference", url: "https://www.verizon.com/home/internet/fios-fastest-internet/" }
    ],
    comps: [
      { address: "45 Richbell Rd, White Plains, NY 10605", url: "https://www.redfin.com/NY/White-Plains/45-Richbell-Rd-10605/home/20182907" },
      { address: "2 Carrigan Ave, White Plains, NY 10605", url: "https://www.redfin.com/NY/White-Plains/2-Carrigan-Ave-10605/home/20183121" },
      { address: "33 Doyer Ave, White Plains, NY 10605", url: "https://www.zillow.com/homedetails/33-Doyer-Ave-White-Plains-NY-10605/32978915_zpid/" },
      { address: "477 Ridgeway, White Plains, NY 10605", url: "https://www.redfin.com/NY/White-Plains/477-Ridgeway-10605/home/20184051" },
      { address: "23 Carrigan Ave, White Plains, NY 10605", url: "https://www.redfin.com/NY/White-Plains/23-Carrigan-Ave-10605/home/20183122" }
    ]
  }
};

// ---------- Helpers ----------
const $ = (s, r=document) => r.querySelector(s);
const fmt$ = n => n.toLocaleString(undefined,{ style:'currency', currency:'USD', maximumFractionDigits:0 });

// Keep older KPI code in sync if it reads sellingProperty.price
if (typeof sellingProperty === "undefined") {
  window.sellingProperty = { price: SELLING.baseValue };
} else {
  sellingProperty.price = SELLING.baseValue;
}

// ---------- Seller net math ----------
function computeSellerNet(salePrice) {
  const c = SELLING;
  const commission = salePrice * c.commissionRate;
  const xfer = salePrice * c.transferTaxRate; // NYS seller transfer tax
  const other = (c.attorneyFee||0) + (c.stagingPhotography||0) + (c.miscClosing||0);
  const net = salePrice - commission - xfer - other;
  return { commission, xfer, other, net };
}

// ---------- Render: Overview cards ----------
(function(){
  const $sale = $('#typicalSaleRange');
  const $buy  = $('#targetBuyRange');
  const $util = $('#utilDelta');
  const $tax  = $('#taxSavings');
  if ($sale) $sale.textContent = `${fmt$(OVERVIEW.typicalSaleRange[0])} - ${fmt$(OVERVIEW.typicalSaleRange[1])}`;
  if ($buy)  $buy.textContent  = `${fmt$(OVERVIEW.targetBuyRange[0])} - ${fmt$(OVERVIEW.targetBuyRange[1])}`;
  if ($util) $util.textContent = (OVERVIEW.monthlyUtilityDelta>=0?"+":"") + `${OVERVIEW.monthlyUtilityDelta}/mo`;
  if ($tax)  $tax.textContent  = fmt$(OVERVIEW.taxSavingsAnnual) + "/yr";
})();

// ---------- Render: Sale strategy table ----------
(function(){
  const addressEl = $('#sellAddress');
  if (addressEl) addressEl.textContent = SELLING.address;

  const tbody = $('#pricingTable tbody');
  if (!tbody) return;
  tbody.innerHTML = "";
  (Array.isArray(SCENARIOS) ? SCENARIOS : []).forEach(s => {
    const { commission, xfer, other, net } = computeSellerNet(s.expectedSale);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.label}</td>
      <td>${fmt$(s.list)}</td>
      <td>${fmt$(s.expectedSale)}</td>
      <td>${fmt$(commission)}</td>
      <td>${fmt$(xfer)}</td>
      <td>${fmt$(other)}</td>
      <td><strong>${fmt$(net)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
})();

// ---------- Render: Top KPI cards (sell/buy/net) ----------
(function(){
  const sellEl = $('#sellPrice');
  if (sellEl) sellEl.textContent = fmt$(SELLING.baseValue);

  const buySel = $('#buyPropertySelect');
  const buyPriceEl = $('#buyPrice');
  const netEl = $('#netDifference');

  function recalc(){
    if (!buySel) return;
    let buyPrice = 0;
    if (typeof buyingProperties !== 'undefined' && buyingProperties.length) {
      const current = buyingProperties.find(p => String(p.id) === String(buySel.value)) || buyingProperties[0];
      buyPrice = current?.price || 0;
      if (buyPriceEl) buyPriceEl.textContent = fmt$(buyPrice);
    }
    if (netEl) {
      const net = SELLING.baseValue - buyPrice;
      netEl.textContent = fmt$(net);
      netEl.className = 'metric-value ' + (net >= 0 ? 'metric-positive' : 'metric-negative');
    }
  }

  if (buySel) {
    buySel.addEventListener('change', recalc);
    recalc();
  }
})();

// ----- SCENARIOS (from research JSON) -----
const SCENARIOS = [
  { label: "Conservative", list: 549000, expectedSale: 540000 },
  { label: "Strategic",    list: 599000, expectedSale: 610000 },
  { label: "Aggressive",   list: 675000, expectedSale: 675000 }
];

// ----- OVERVIEW cards (tie sale range to valuation range) -----
const OVERVIEW = {
  typicalSaleRange: [525000, 675000],  // valuation.range.low/high
  targetBuyRange: [435000, 470000],    // adjust later as needed
  monthlyUtilityDelta: -65,            // placeholder until buy-side is wired
  taxSavingsAnnual: 1043
};

 
// ===== Interactive Transaction Timeline & Strategy =====

// Small date helpers
function toISODate(d){ const z = new Date(d); const off = z.getTimezoneOffset(); const local = new Date(z.getTime() - off*60000); return local.toISOString().slice(0,10); }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtRange(start, days){
  const s = new Date(start);
  const e = addDays(start, Math.max(0, days-1));
  const f = (x) => x.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  return `${f(s)} – ${f(e)}`;
}
function daysBetween(a, b){ const ms = (new Date(b)) - (new Date(a)); return Math.round(ms/86400000)+1; }

// Season from start date
function inferSeason(d){
  const m = (new Date(d)).getMonth()+1;
  if (m>=3 && m<=6) return 'spring';
  if (m>=7 && m<=8) return 'summer';
  if (m>=9 && m<=11) return 'fall';
  return 'winter';
}

// Core planning engine
function computeTxPlan(opts){
  // Defaults & factors tuned for NY attorney closings
  const season = opts.season === 'auto' ? inferSeason(opts.start) : opts.season;

  // Season DOM multipliers (heuristic): spring -15%, summer baseline, fall +10%, winter +25%
  const seasonMul = { spring: 0.85, summer: 1.00, fall: 1.10, winter: 1.25 }[season] || 1.0;

  // Sell: baseline days-on-market by heat (then season-adjust)
  const sellDOMBase = { slow: 45, balanced: 35, competitive: 18 }[opts.sellHeat] || 35;
  const sellDOM = Math.round(sellDOMBase * seasonMul);

  // Buy: time to accepted offer by heat (more competitive = longer to land)
  const buyOfferCycle = { slow: 3, balanced: 7, competitive: 12 }[opts.buyHeat] || 7;

  // Contract-to-close durations for buy (NY attorney closings)
  let buyCTC = 45; // conventional default
  if (opts.financing === 'cash') buyCTC = 25;
  if (opts.financing === 'conv10') buyCTC = 50;
  if (opts.financing === 'fha' || opts.financing === 'va') buyCTC = 55;

  // HOA adds lender questionnaire/resale docs lag
  const hoaLag = (opts.propType === 'hoa') ? 7 : 0;

  // Seller side: assume buyer is financed → 45 days CTC
  const sellCTC = 45;

  // Upfront prep window (pre-inspection + light fixes + photos/stage)
  const prep = 10;

  // Negotiate window after marketing burst
  const negotiate = 5;

  const steps = [];
  let cursor = new Date(opts.start);

  // 1) Preparation
  steps.push({
    no: 1,
    title: "Week 0–1: Preparation",
    start: toISODate(cursor),
    days: prep,
    notes: "Pre-inspection; minor repairs; agent interviews; photography & staging; mortgage pre-approval."
  });
  cursor = addDays(cursor, prep);

  // 2) List White Plains (marketing window ~ DOM)
  steps.push({
    no: 2,
    title: "Week 1–3: List White Plains",
    start: toISODate(cursor),
    days: sellDOM,
    notes: `Strategic pricing; open houses; targeted outreach. Season: ${season}.`
  });
  cursor = addDays(cursor, sellDOM);

  // 3) Negotiate & Accept Offer (sell)
  steps.push({
    no: 3,
    title: "Week 2–4: Negotiate & Accept (Sell)",
    start: toISODate(cursor),
    days: negotiate,
    notes: "Attorney review, terms, contingencies; sign contracts; schedule tentative closing."
  });
  const sellContractDate = toISODate(cursor); // when negotiating starts
  cursor = addDays(cursor, negotiate);

  // Determine when to pursue the buy offer
  let buyOfferStart;
  if (opts.saleContingency === 'yes') {
    // Safer: start buy offer right after seller contracts are signed
    buyOfferStart = addDays(sellContractDate, 0);
  } else {
    // Parallel path: begin toward end of marketing to reduce gap risk
    buyOfferStart = addDays(opts.start, prep + Math.max(7, Math.round(sellDOM * 0.6)));
  }

  // 4) Make Loudonville Offer
  const buyOfferStartISO = toISODate(buyOfferStart);
  steps.push({
    no: 4,
    title: "Week 3–4: Make Loudonville Offer",
    start: buyOfferStartISO,
    days: buyOfferCycle,
    notes: (opts.propType === 'hoa' ? "Request HOA resale packet; " : "") + "Tour thoroughly; submit competitive terms; align close with sell date."
  });
  const buyAcceptDate = toISODate(addDays(buyOfferStart, buyOfferCycle));

  // 5) Due Diligence (buy)
  const insp = 7; // inspection period
  const appraisal = (opts.financing === 'cash') ? 0 : 10;
  let commitment = 0;
  if (opts.financing === 'cash') {
    commitment = 0;
  } else if (opts.financing === 'conv20') {
    commitment = 25;
  } else if (opts.financing === 'conv10') {
    commitment = 28;
  } else {
    commitment = 30;
  }
  const ddDays = insp + Math.max(appraisal, 0) + Math.max(commitment, 0) + hoaLag;

  steps.push({
    no: 5,
    title: "Week 4–6: Due Diligence (Buy)",
    start: buyAcceptDate,
    days: ddDays,
    notes: [
      `Inspection ${insp}d`,
      (appraisal ? `Appraisal ${appraisal}d` : "No appraisal (cash)"),
      (commitment ? `Mortgage commitment ${commitment}d` : "No mortgage (cash)"),
      (hoaLag ? `HOA docs +${hoaLag}d` : null)
    ].filter(Boolean).join(" • ")
  });

  // 6) Closings
  // Sell close date target = sell contract + sellCTC
  const sellCloseTarget = toISODate(addDays(sellContractDate, sellCTC));

  // Buy close aligned per user preference
  let buyCloseTarget;
  if (opts.closeOrder === 'same_day') {
    buyCloseTarget = sellCloseTarget;
  } else if (opts.closeOrder === 'gap_3') {
    buyCloseTarget = toISODate(addDays(sellCloseTarget, 3));
  } else { // buy_first (bridge)
    // buy CTC measured from buyAcceptDate plus buyCTC
    buyCloseTarget = toISODate(addDays(buyAcceptDate, buyCTC + hoaLag));
  }

  const closeStart = (opts.closeOrder === 'buy_first') ? buyCloseTarget : sellCloseTarget;
  const closeDays = (opts.closeOrder === 'same_day') ? 1 : 3;

  steps.push({
    no: 6,
    title: "Week 6–8: Closings",
    start: closeStart,
    days: closeDays,
    notes: (opts.closeOrder === 'same_day')
      ? "Close sale AM, purchase PM; wire proceeds; keys/movers coordinated."
      : (opts.closeOrder === 'gap_3')
        ? "Close sale, then purchase ~3 days later; short-term storage or rent-back recommended."
        : "Buy before selling (bridge funds or cash)."
  });

  // Totals & flags
  const totalDays = daysBetween(opts.start, addDays(closeStart, Math.max(0, closeDays-1)));
  let rateLockSuggest = 0;
  if (opts.financing !== 'cash') {
    // lock suggested from buyAcceptDate to buyCloseTarget + buffer
    const lockSpan = Math.max(1, daysBetween(buyAcceptDate, buyCloseTarget));
    rateLockSuggest = lockSpan <= 45 ? 45 : 60;
  }

  const flags = [];

  // Risk: buy scheduled before sale close & not bridge?
  if (opts.closeOrder === 'buy_first' && opts.saleContingency === 'yes') {
    flags.push("Buy scheduled before sale with a sale contingency — high risk of denial.");
  }

  // Risk: HOA doc lag
  if (opts.propType === 'hoa') flags.push("HOA resale packet can delay underwriting; order early.");

  // Risk: Competitive buy with thin down payment
  (function(){
    const downEl = document.getElementById('downPctInput');
    const dp = downEl ? parseFloat(downEl.value) : (typeof BUY_DEFAULTS !== 'undefined' ? BUY_DEFAULTS.downPct : 0.2);
    if (opts.buyHeat === 'competitive' && dp < 0.2 && opts.financing !== 'cash') {
      flags.push("Competitive buy: <20% down may need stronger terms (EMD, appraisal buffer, shorter inspection).");
    }
  })();

  // Risk: rate-lock vs timeline
  if (opts.financing !== 'cash' && rateLockSuggest >= 60) {
    flags.push("Consider 60-day rate lock or lock extension buffer.");
  }

  return { steps, totalDays, rateLockSuggest, flags, season, sellDOM, buyOfferCycle, sellCloseTarget, buyCloseTarget };
}

function renderTxPlan(){
  const startEl = document.getElementById('txStartDate');
  const seasonEl = document.getElementById('season');
  const sellHeatEl = document.getElementById('sellHeat');
  const buyHeatEl = document.getElementById('buyHeat');
  const propTypeEl = document.getElementById('propType');
  const finEl = document.getElementById('financing');
  const saleContEl = document.getElementById('saleContingency');
  const orderEl = document.getElementById('closeOrder');

  const opts = {
    start: startEl?.value || toISODate(new Date()),
    season: seasonEl?.value || 'auto',
    sellHeat: sellHeatEl?.value || 'balanced',
    buyHeat: buyHeatEl?.value || 'competitive',
    propType: propTypeEl?.value || 'sfh',
    financing: finEl?.value || 'conv20',
    saleContingency: saleContEl?.value || 'no',
    closeOrder: orderEl?.value || 'same_day'
  };

  const result = computeTxPlan(opts);

  // Fill KPI cards
  const durEl = document.getElementById('txTotalDuration');
  if (durEl) durEl.textContent = `${result.totalDays} days`;

  const lockEl = document.getElementById('txRateLock');
  if (lockEl) lockEl.textContent = (result.rateLockSuggest ? `${result.rateLockSuggest} days` : "N/A (cash)");

  const flagsEl = document.getElementById('txFlags');
  if (flagsEl) flagsEl.innerHTML = result.flags.length
    ? result.flags.map(f => `<span class="risk-badge">RISK</span>${f}`).join("<br>")
    : "None";

  // Render table
  const tbody = document.querySelector('#txPlanTable tbody');
  if (tbody) {
    tbody.innerHTML = '';
    result.steps.forEach(step => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="phase-badge">${step.no}</span></td>
        <td>${step.title}</td>
        <td>${fmtRange(step.start, step.days)}</td>
        <td>${step.days}</td>
        <td>${step.notes}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Store last plan for ICS export
  window.__TX_LAST_PLAN__ = result;
}

// ICS export (all-day events per phase)
function exportTxPlanICS(){
  const res = window.__TX_LAST_PLAN__;
  if (!res || !res.steps?.length) return;

  function dt(yMd){ return yMd.replaceAll('-',''); }
  const lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//z.colonie.town//TransactionPlan//EN"
  ];
  res.steps.forEach(s => {
    const start = dt(s.start);
    const end = dt(toISODate(addDays(s.start, Math.max(0, s.days-1))));
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${crypto?.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2))}@z.colonie.town`);
    lines.push(`DTSTAMP:${dt(toISODate(new Date()))}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`DTEND;VALUE=DATE:${dt(toISODate(addDays(end,1)))}`); // inclusive end
    lines.push(`SUMMARY:${s.title}`);
    lines.push(`DESCRIPTION:${(s.notes||'').replace(/\r?\n/g,' ')}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "transaction-plan.ics";
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

// Wire up
(function(){
  const startEl = document.getElementById('txStartDate');
  if (startEl && !startEl.value) startEl.value = toISODate(new Date());

  const doRender = () => renderTxPlan();

  ['txStartDate','season','sellHeat','buyHeat','propType','financing','saleContingency','closeOrder']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', doRender);
      if (el && el.tagName === 'SELECT') el.addEventListener('change', doRender);
    });

  const recalcBtn = document.getElementById('txRecalcBtn');
  if (recalcBtn) recalcBtn.addEventListener('click', doRender);

  const exportBtn = document.getElementById('txExportICS');
  if (exportBtn) exportBtn.addEventListener('click', exportTxPlanICS);

  // initial render
  renderTxPlan();
  
  // Mobile nav toggle for accessibility
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Header KPIs: reflect initial baseline numbers if present
  const kpiSell = document.getElementById('kpiSellBaseline');
  if (kpiSell) kpiSell.textContent = fmt$(SELLING.baseValue);
  const kpiTaxes = document.getElementById('kpiTaxesAnnual');
  if (kpiTaxes) kpiTaxes.textContent = fmt$(Math.round(SELLING.costs.taxes_annual));
  const kpiBuy = document.getElementById('kpiBuyDefault');
  if (kpiBuy && Array.isArray(buyingProperties) && buyingProperties.length) {
    kpiBuy.textContent = fmt$(buyingProperties[0].price);
  }
})();
 