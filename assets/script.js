// Example Data
const sellingProperty = {
    address: "54 Collyer Pl, White Plains, NY 10605",
    price: 785000,
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
    document.getElementById("propertyDetails").innerHTML = `
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

const SELLING = {
  address: "54 Collyer Pl, White Plains, NY 10605",
  baseValue: 1050000,      // TODO: replace with your verified value
  commissionRate: 0.04,    // adjust to agreement
  transferTaxRate: 0.004,  // NYS seller transfer tax 0.4%
  attorneyFee: 2200,
  stagingPhotography: 3000,
  miscClosing: 1500
};

// Ensure old top-of-page metrics don’t show $0
if (typeof sellingProperty === "undefined") {
  window.sellingProperty = { price: SELLING.baseValue };
} else {
  sellingProperty.price = SELLING.baseValue;
}

const OVERVIEW = {
  typicalSaleRange: [975000, 1100000],
  targetBuyRange: [435000, 470000],
  monthlyUtilityDelta: -65,
  taxSavingsAnnual: 1043
};

const SCENARIOS = [
  { label: "Conservative", list: 975000, expectedSale: 975000 },
  { label: "Strategic",   list: 999000, expectedSale: 1050000 },
  { label: "Aggressive",  list: 1100000, expectedSale: 1100000 }
];

const fmtMoney = n => n.toLocaleString(undefined,{ style:'currency', currency:'USD', maximumFractionDigits:0 });

function computeSellerNet(salePrice) {
  const c = SELLING;
  const commission = salePrice * c.commissionRate;
  const xfer = salePrice * c.transferTaxRate;
  const other = (c.attorneyFee||0) + (c.stagingPhotography||0) + (c.miscClosing||0);
  const net = salePrice - commission - xfer - other;
  return { commission, xfer, other, net };
}

// Overview cards
(function (){
  const $sale = document.getElementById('typicalSaleRange');
  const $buy  = document.getElementById('targetBuyRange');
  const $util = document.getElementById('utilDelta');
  const $tax  = document.getElementById('taxSavings');
  if ($sale) $sale.textContent = `${fmtMoney(OVERVIEW.typicalSaleRange[0])} - ${fmtMoney(OVERVIEW.typicalSaleRange[1])}`;
  if ($buy)  $buy.textContent  = `${fmtMoney(OVERVIEW.targetBuyRange[0])} - ${fmtMoney(OVERVIEW.targetBuyRange[1])}`;
  if ($util) $util.textContent = (OVERVIEW.monthlyUtilityDelta>=0?"+":"") + `${OVERVIEW.monthlyUtilityDelta}/mo`;
  if ($tax)  $tax.textContent  = fmtMoney(OVERVIEW.taxSavingsAnnual) + "/yr";
})();

// Sale strategy table
(function (){
  const addr = document.getElementById('sellAddress');
  if (addr) addr.textContent = SELLING.address;

  const tbody = document.querySelector('#pricingTable tbody');
  if (!tbody) return;
  tbody.innerHTML = "";

  SCENARIOS.forEach(s => {
    const { commission, xfer, other, net } = computeSellerNet(s.expectedSale);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.label}</td>
      <td>${fmtMoney(s.list)}</td>
      <td>${fmtMoney(s.expectedSale)}</td>
      <td>${fmtMoney(commission)}</td>
      <td>${fmtMoney(xfer)}</td>
      <td>${fmtMoney(other)}</td>
      <td><strong>${fmtMoney(net)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
})();
 