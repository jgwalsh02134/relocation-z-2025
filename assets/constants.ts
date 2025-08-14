// Core constants and defaults for Relocation-Z-2025

export const ADDRESSES = {
  sell: "54 Collyer Pl, White Plains, NY 10605",
  buyExample: "8 Loudonwood East, Loudonville, NY 12211",
};

export const DEFAULTS = {
  saleBaseValue: 600_000,
  commissionRate: 0.04, // 4%
  transferTaxRate: 0.004, // NYS seller transfer tax (0.4%)
  attorneyFee: 2200,
  staging: 3000,
  misc: 1500,
  buyerDownPct: 0.20,
  pitiMonthly: 3_200, // placeholder; UI should overwrite when known
  utilitiesMonthly: 390,
};

export const SCENARIO_FACTORS = {
  conservative: 0.95,
  likely: 1.02,
  optimistic: 1.12,
};

export const UI_IDS = {
  views: {
    welcome: "onboarding-view",
    sell: "sell-view",
    buy: "buy-view",
    timing: "timing-view",
    checklists: "checklists-view",
    summary: "summary-view",
  },
};

export type SaleCostBreakdown = {
  commission: number;
  transferTax: number;
  attorney: number;
  staging: number;
  misc: number;
  net: number;
};


