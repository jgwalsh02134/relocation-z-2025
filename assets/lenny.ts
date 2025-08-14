// Deterministic microcopy generator for Lenny Lodge

export type LennyContext =
  | "welcome"
  | "loading"
  | "sell"
  | "costs"
  | "scenario"
  | "buy"
  | "mortgage"
  | "timing"
  | "save"
  | "empty"
  | "error"
  | "confirm"
  | "privacy";

const LINES: Record<LennyContext, string[]> = {
  welcome: [
    "Welcome aboard. I’m Lenny, your relocation concierge—clipboard optional.",
    "You focus on the keys. I’ll keep the math tidy and the timeline honest.",
  ],
  loading: [
    "Crunching numbers. No trees harmed.",
    "Sharpening pencils. They insist on being mechanical.",
  ],
  sell: [
    "We’ll price for demand, not drama.",
    "Net proceeds, not wishful thinking. That’s our north star.",
  ],
  costs: [
    "Line items don’t bite. We’ll list them anyway.",
    "Every dollar gets a seat on the ledger.",
  ],
  scenario: [
    "Conservative to optimistic—pick your comfort, I’ll do the calculus.",
    "Switch scenarios anytime. The spreadsheet doesn’t take it personally.",
  ],
  buy: [
    "Loudonville, Colonie—good options. We’ll make the numbers behave.",
    "We’ll land your target without acrobatics at closing.",
  ],
  mortgage: [
    "Cash is simple; conventional is normal. Either way, no surprises.",
    "Rate locks beat guesswork.",
  ],
  timing: [
    "Days between closings—keep it tight, keep it tidy.",
    "Overlap costs: small numbers, big decisions.",
  ],
  save: [
    "Saved locally. Your attorney can have the tidy PDF.",
    "All set. I filed it under ‘Sensible Decisions’.",
  ],
  empty: [
    "Nothing here yet. I’ll wait—patiently, like a beaver at a dam.",
    "Add a detail, and I’ll add the math.",
  ],
  error: [
    "That didn’t compute. Let’s fix the inputs before the outputs revolt.",
    "I object, your honor—on grounds of malformed data.",
  ],
  confirm: [
    "Looks right. Onward.",
    "Confirmed. The plan survives contact with reality—for now.",
  ],
  privacy: [
    "All local. Nothing leaves the page unless you print it.",
    "No cloud, just numbers. Your business stays yours.",
  ],
};

// Deterministic pick: stableKey ensures the same line for a given context+key
export function getLennyLine(context: LennyContext, stableKey: string): string {
  const pool = LINES[context] || ["Hello."];
  let hash = 2166136261;
  const key = `${context}::${stableKey}`;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const idx = Math.abs(hash) % pool.length;
  return pool[idx];
}


