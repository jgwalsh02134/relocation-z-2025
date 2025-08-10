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

// Populate Buy Property Selector
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
    document.getElementById("netDifference").textContent = `$${(sellingProperty.price - buyProp.price).toLocaleString()}`;

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

// Chart.js Setup
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
    options: { responsive: true }
});

// Event Listener
buySelect.addEventListener("change", updateDashboard);

// Init
buySelect.value = buyingProperties[0].id;
updateDashboard();
