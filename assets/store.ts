export type AppState = {
  scenario: "conservative" | "likely" | "optimistic";
  overlapDays: number;
  buyerDownPct: number;
};

const KEY = "rz25.state";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { scenario: "likely", overlapDays: 0, buyerDownPct: 0.2 };
    const parsed = JSON.parse(raw);
    return {
      scenario: parsed.scenario || "likely",
      overlapDays: Number(parsed.overlapDays) || 0,
      buyerDownPct: Number(parsed.buyerDownPct) || 0.2,
    };
  } catch {
    return { scenario: "likely", overlapDays: 0, buyerDownPct: 0.2 };
  }
}

export function saveState(next: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}


