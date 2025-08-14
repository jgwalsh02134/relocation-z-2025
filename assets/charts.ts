import Chart from "chart.js/auto";

export type ScenarioDatum = {
  label: string;
  gross: number;
  net: number;
};

export function renderGrossNetBar(canvas: HTMLCanvasElement, data: ScenarioDatum[]) {
  const labels = data.map(d => d.label);
  const gross = data.map(d => d.gross);
  const net = data.map(d => d.net);

  return new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Gross", data: gross, backgroundColor: "#94a3b8" },
        { label: "Net", data: net, backgroundColor: "#1e40af" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: { x: { stacked: false }, y: { beginAtZero: true } },
      plugins: { legend: { position: "bottom" } },
    },
  });
}

export function renderOverlapLine(canvas: HTMLCanvasElement, points: { x: number; y: number }[]) {
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: points.map(p => String(p.x)),
      datasets: [
        {
          label: "Overlap Cost ($)",
          data: points.map(p => p.y),
          borderColor: "#1e40af",
          backgroundColor: "rgba(30,64,175,.1)",
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { position: "bottom" } },
    },
  });
}


