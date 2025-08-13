import { DEFAULTS, SaleCostBreakdown } from "./constants";

export function computeSaleCosts(salePrice: number): SaleCostBreakdown {
  const commission = salePrice * DEFAULTS.commissionRate;
  const transferTax = salePrice * DEFAULTS.transferTaxRate;
  const attorney = DEFAULTS.attorneyFee;
  const staging = DEFAULTS.staging;
  const misc = DEFAULTS.misc;
  const net = salePrice - commission - transferTax - attorney - staging - misc;
  return { commission, transferTax, attorney, staging, misc, net };
}

export function monthlyCarrying(loanPITI: number, utilitiesMonthly: number): number {
  return (loanPITI || 0) + (utilitiesMonthly || 0);
}

export function overlapCost(days: number, monthly: number): number {
  const daily = (monthly || 0) / 30;
  return Math.max(0, Math.round(daily * Math.max(0, days)));
}


