/**
 * Salary display & conversion helpers.
 * Backend stores paise; UI works in rupees.
 */
import {
  paiseToRupees,
  rupeesToPaise,
  mapApiCalculationValueToUi,
  mapUiCalculationValueToApi,
} from "./salaryAmountUtils.ts";
import type { ApiCalculationType, UIStructureCalculationType } from "./salaryTypes.ts";
import { SPECIAL_ALLOWANCE_CODES, BASIC_COMPONENT_CODES } from "./salaryConstants.ts";

export {
  paiseToRupees,
  rupeesToPaise,
  mapApiCalculationValueToUi,
  mapUiCalculationValueToApi,
};

export function formatSalaryFromPaise(amountPaise: number): string {
  const rupees = paiseToRupees(amountPaise);
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)} Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)} L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)} K`;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatExactFromPaise(amountPaise: number): string {
  return `₹${paiseToRupees(amountPaise).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatRupees(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount ?? 0);
}

export function formatRupeesCurrency(amount: number): string {
  return `₹${formatRupees(amount)}`;
}

export function formatCurrencyFromPaise(amountPaise: number): string {
  return `₹${paiseToRupees(amountPaise).toLocaleString("en-IN")}`;
}

export function isSpecialAllowanceCode(code: string | undefined | null): boolean {
  if (!code) return false;
  return SPECIAL_ALLOWANCE_CODES.includes(code as (typeof SPECIAL_ALLOWANCE_CODES)[number]);
}

export function isBasicComponent(comp: {
  componentCode?: string;
  componentName?: string;
}): boolean {
  const code = (comp.componentCode ?? "").toUpperCase();
  const name = (comp.componentName ?? "").toLowerCase();
  return (
    BASIC_COMPONENT_CODES.includes(code as (typeof BASIC_COMPONENT_CODES)[number]) ||
    name.includes("basic salary") ||
    name === "basic"
  );
}

export function resolveEffectiveCalculationType(comp: {
  calculationType?: string;
  overrideCalculationType?: string;
}): string {
  return (comp.overrideCalculationType || comp.calculationType || "FIXED").toUpperCase();
}

export function resolveEffectiveCalculationBase(comp: {
  calculationBase?: string | null;
  overrideCalculationBase?: string | null;
}): string | null {
  return comp.overrideCalculationBase ?? comp.calculationBase ?? null;
}

export function isIncludedInCTC(comp: {
  includeInCtc?: boolean;
  includeInCTC?: boolean;
}): boolean {
  const raw = comp.includeInCtc ?? comp.includeInCTC;
  return raw === true || String(raw).toLowerCase() === "true";
}

export function mapApiToUIStructureCalcType(comp: {
  calculationType?: string;
  overrideCalculationType?: string;
  calculationBase?: string | null;
  overrideCalculationBase?: string | null;
}): UIStructureCalculationType {
  const calcType = resolveEffectiveCalculationType(comp);
  const calcBase = resolveEffectiveCalculationBase(comp);

  if (calcType === "FIXED") return "Fixed";
  if (calcBase === "PERCENTAGE_OF_BASIC") return "Percentage of Basic";
  if (calcBase === "PERCENTAGE_OF_GROSS") return "Percentage of Gross";
  if (calcType === "STATUTORY" || calcType === "FORMULA") return "Formula";
  return "Fixed";
}

export function mapUIStructureToApi(calcType: UIStructureCalculationType): {
  calculationType: ApiCalculationType | "PERCENTAGE";
  calculationBase: string | null;
} {
  switch (calcType) {
    case "Fixed":
      return { calculationType: "FIXED", calculationBase: null };
    case "Percentage of Basic":
      return { calculationType: "PERCENTAGE", calculationBase: "PERCENTAGE_OF_BASIC" };
    case "Percentage of Gross":
      return { calculationType: "PERCENTAGE", calculationBase: "PERCENTAGE_OF_GROSS" };
    case "Formula":
      return { calculationType: "FORMULA", calculationBase: null };
    default:
      return { calculationType: "FIXED", calculationBase: null };
  }
}

export function getDisplayValueForApiComponent(comp: {
  calculationType?: string;
  overrideCalculationType?: string;
  calculationBase?: string | null;
  overrideCalculationBase?: string | null;
  calculationValue?: number | null;
}): string {
  const calcType = resolveEffectiveCalculationType(comp);
  const calcBase = resolveEffectiveCalculationBase(comp);

  if (calcType === "FIXED") {
    const rupees = mapApiCalculationValueToUi("FIXED", comp.calculationValue ?? 0);
    return `₹${rupees.toLocaleString("en-IN")} fixed`;
  }
  if (calcBase === "PERCENTAGE_OF_BASIC") return `${comp.calculationValue ?? 0}% of Basic`;
  if (calcBase === "PERCENTAGE_OF_GROSS") return `${comp.calculationValue ?? 0}% of Gross`;
  if (calcType === "FORMULA") return "Formula";
  return `${comp.calculationValue ?? 0}%`;
}

export function extractMonthlyCTCPaiseFromEmployeeRow(emp: Record<string, unknown>): number {
  if (emp.monthlyCtc != null) return Number(emp.monthlyCtc);
  if (emp.monthlySalary != null) return Number(emp.monthlySalary);
  if (emp.ctcAnnual != null) return Math.round(Number(emp.ctcAnnual) / 12);
  if (emp.ctc != null) return Math.round(Number(emp.ctc) / 12);
  return 0;
}

export function extractAnnualCTCPaiseFromEmployeeRow(emp: Record<string, unknown>): number {
  if (emp.ctcAnnual != null) return Number(emp.ctcAnnual);
  if (emp.ctc != null) return Number(emp.ctc);
  return extractMonthlyCTCPaiseFromEmployeeRow(emp) * 12;
}

export function isExistingStructureComponentId(idStr: string): boolean {
  return !!idStr && idStr.length < 10;
}

export function formatDateDisplay(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function normalizeBasicComponentCode(name: string): string {
  if (name === "Basic Salary" || name === "Basic") return "BASIC";
  return name.toUpperCase().replace(/\s+/g, "_");
}
