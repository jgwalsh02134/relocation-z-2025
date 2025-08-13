export type ChecklistItem = {
  title: string;
  what: string;
  how: string[];
  tip: string;
};

export const SELL_CHECKLIST: ChecklistItem[] = [
  {
    title: "Pre-Listing Inspection",
    what: "Optional, but clarifies scope and reduces renegotiations.",
    how: [
      "Hire a licensed NY inspector (ask for sample report).",
      "Address safety issues and simple wins (GFCI, leaks, handrails).",
      "Keep receipts; your attorney may attach addendum for known items.",
    ],
    tip: "Fix small, disclose big. Buyers forgive honesty, not surprises.",
  },
  {
    title: "Declutter & Stage",
    what: "Make rooms feel larger and brighter; photos drive demand.",
    how: [
      "Remove 30–40% of visible items; rent a short-term pod if needed.",
      "Neutral bedding, warm lamps, fresh mulch; professional photos.",
      "Schedule listing to hit mid-week for weekend momentum.",
    ],
    tip: "Staging is marketing, not furniture. ROI is in the listing photos.",
  },
  {
    title: "NYS Property Condition Disclosure",
    what: "NY requires disclosure or a $500 credit; attorney will advise.",
    how: [
      "Discuss with your attorney whether to disclose or credit.",
      "If disclosing, complete accurately; attach known repairs and permits.",
      "If crediting, ensure contract reflects the credit in writing.",
    ],
    tip: "Clarity now saves emails later.",
  },
];

export const MOVE_CHECKLIST: ChecklistItem[] = [
  {
    title: "Movers & Storage",
    what: "Reserve reputable movers early; consider short gap storage.",
    how: [
      "Get 2–3 quotes; confirm insurance and move date window.",
      "Ask about overnight truck hold for same-day close and move.",
      "If gap days, arrange storage or seller rent-back.",
    ],
    tip: "Good movers book out—money well spent on closing week.",
  },
  {
    title: "Utilities & Accounts",
    what: "Transfer or start service to avoid outages and late fees.",
    how: [
      "Schedule electric, gas, water/sewer; internet install window.",
      "Set mail forward; update banking, employer, insurance.",
      "Record move-in photos for deposits and warranties.",
    ],
    tip: "Overlap a few days for internet—install calendars are ruthless.",
  },
];


