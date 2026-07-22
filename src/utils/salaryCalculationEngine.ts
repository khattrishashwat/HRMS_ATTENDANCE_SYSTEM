/**
 * Centralized salary calculation engine — single source of truth.
 * All monetary outputs are in RUPEES unless explicitly named *Paise*.
 *
 * Recursion safeguards:
 * - resolveBasicSalaryAmount() never calls calculateComponentAmount()
 * - calculateComponentAmount() uses resolveBasicSalaryAmount() for basic, never re-enters
 * - Special Allowance is computed via balancing formula, not via gross → SA loop
 */
import type {
  CalculatedComponentLine,
  RawSalaryComponent,
  SalaryBreakdown,
  SpecialAllowanceInfo,
  StructureDeductionRow,
  StructureEarningRow,
  StructureEmployerRow,
  EmployeeSalaryComponentRow,
  UIStructureCalculationType,
} from "./salaryTypes.ts";
import {
  PF_EMPLOYER_CAP,
  PF_EMPLOYER_RATE,
  GRATUITY_RATE,
  PF_EMPLOYER_NAME_PATTERNS,
  GRATUITY_NAME_PATTERNS,
  SPECIAL_ALLOWANCE_FORMULA,
  LOCKED_COMPONENT_CODES,
  DEFAULT_BASIC_PERCENT_OF_GROSS,
  CALC_TYPE_DEFAULTS,
} from "./salaryConstants.ts";
import {
  isSpecialAllowanceCode,
  isBasicComponent,
  resolveEffectiveCalculationType,
  resolveEffectiveCalculationBase,
  isIncludedInCTC,
  mapApiCalculationValueToUi,
  mapUIStructureToApi,
  normalizeBasicComponentCode,
  paiseToRupees,
} from "./salaryHelpers.ts";
import { isBasicPercentageOfBasicInvalid, validateBeforeCalculation, sanitizeAmount, sanitizePercentage } from "./salaryValidation.ts";

export interface CalculateBreakdownOptions {
  monthlyCTC: number;
  components: RawSalaryComponent[];
}

export interface ComponentAmountOptions {
  valuesAreRupees?: boolean;
  /** When true, SA returns 0 instead of computing balance */
  skipSpecialAllowance?: boolean;
  /** Pre-resolved basic salary in rupees — avoids re-computation */
  basicSalaryOverride?: number;
}

function roundAmount(amount: number): number {
  return Math.max(0, Math.round(amount));
}

function matchesNamePattern(name: string | undefined, patterns: string[]): boolean {
  if (!name) return false;
  const upper = name.toUpperCase();
  return patterns.some(
    (p) => name === p || upper === p.toUpperCase() || upper.includes(p.toUpperCase())
  );
}

function isFixedType(type: string): boolean {
  return type === "FIXED";
}

function isPercentageOfBasic(type: string, base: string | null): boolean {
  return type === "PERCENTAGE_OF_BASIC" || (type === "PERCENTAGE" && base === "PERCENTAGE_OF_BASIC");
}

function isPercentageOfGross(type: string, base: string | null): boolean {
  return (
    type === "PERCENTAGE_OF_GROSS" ||
    base === "PERCENTAGE_OF_GROSS" ||
    (type === "PERCENTAGE" && base !== "PERCENTAGE_OF_BASIC")
  );
}

function getConfigValue(comp: RawSalaryComponent, valuesAreRupees?: boolean): number {
  const type = resolveEffectiveCalculationType(comp);
  const raw = comp.calculationValue ?? 0;
  if (valuesAreRupees) {
    if (isFixedType(type)) return sanitizeAmount(raw);
    return sanitizePercentage(raw);
  }
  if (isFixedType(type)) return sanitizeAmount(mapApiCalculationValueToUi("FIXED", raw));
  return sanitizePercentage(raw);
}

function getMaxLimitRupees(comp: RawSalaryComponent): number | null {
  if (comp.overrideMaximumLimit == null) return null;
  return mapApiCalculationValueToUi("FIXED", comp.overrideMaximumLimit);
}

function applyLimit(amount: number, comp: RawSalaryComponent): number {
  const safeAmount = sanitizeAmount(amount);
  const limit = getMaxLimitRupees(comp);
  if (limit !== null && safeAmount > limit) return limit;
  return safeAmount;
}

function findBasicComponent(components: RawSalaryComponent[]): RawSalaryComponent | undefined {
  return components.find((c) => c.componentType === "EARNING" && isBasicComponent(c));
}

/**
 * Resolve Basic Salary directly — NEVER calls calculateComponentAmount (prevents infinite recursion).
 */
function resolveBasicSalaryAmount(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): number {
  const basicComp = findBasicComponent(components);

  if (!basicComp) {
    return roundAmount(monthlyCTC * (DEFAULT_BASIC_PERCENT_OF_GROSS / 100));
  }

  if (isBasicPercentageOfBasicInvalid(basicComp)) {
    return 0;
  }

  const type = resolveEffectiveCalculationType(basicComp);
  const base = resolveEffectiveCalculationBase(basicComp);
  const val = getConfigValue(basicComp, options?.valuesAreRupees);

  let amount = 0;
  if (isFixedType(type)) {
    amount = val;
  } else if (isPercentageOfGross(type, base)) {
    amount = roundAmount((val / 100) * monthlyCTC);
  } else if (isPercentageOfBasic(type, base)) {
    amount = 0;
  } else if (type === "STATUTORY" || type === "FORMULA") {
    amount = 0;
  } else {
    amount = val;
  }

  return applyLimit(amount, basicComp);
}

function resolveBasicSalaryForCalculation(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options: ComponentAmountOptions
): number {
  if (typeof options.basicSalaryOverride === "number") {
    return options.basicSalaryOverride;
  }
  return resolveBasicSalaryAmount(monthlyCTC, components, options);
}

/** Sum of non-SA earnings + employer-in-CTC, then balance against monthly CTC */
function computeSpecialAllowanceBalance(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options: ComponentAmountOptions
): number {
  const basicSalary = resolveBasicSalaryForCalculation(monthlyCTC, components, options);

  const calcOpts: ComponentAmountOptions = {
    ...options,
    skipSpecialAllowance: true,
    basicSalaryOverride: basicSalary,
  };

  const otherEarningsTotal = components
    .filter((c) => c.componentType === "EARNING" && !isSpecialAllowanceCode(c.componentCode))
    .reduce((sum, c) => sum + calculateComponentAmount(c, monthlyCTC, components, calcOpts), 0);

  const employerInCTC = components
    .filter((c) => c.componentType === "EMPLOYER_CONTRIBUTION" && isIncludedInCTC(c))
    .reduce((sum, c) => sum + calculateComponentAmount(c, monthlyCTC, components, calcOpts), 0);

  return Math.max(0, roundAmount(monthlyCTC - otherEarningsTotal - employerInCTC));
}

export function calculateStatutoryComponent(comp: RawSalaryComponent, basicSalary: number): number {
  const name = comp.componentName ?? comp.componentCode ?? "";
  if (matchesNamePattern(name, PF_EMPLOYER_NAME_PATTERNS)) {
    return roundAmount(Math.min(basicSalary * PF_EMPLOYER_RATE, PF_EMPLOYER_CAP));
  }
  if (matchesNamePattern(name, GRATUITY_NAME_PATTERNS)) {
    return roundAmount(basicSalary * GRATUITY_RATE);
  }
  const type = resolveEffectiveCalculationType(comp);
  if (type === "STATUTORY") {
    const rawPct = (comp.calculationValue ?? 0) > 0 ? (comp.calculationValue ?? 12) : 12;
    const pct = sanitizePercentage(rawPct);
    return roundAmount((pct / 100) * sanitizeAmount(basicSalary));
  }
  return 0;
}

export function calculateBasicSalary(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): number {
  return resolveBasicSalaryAmount(monthlyCTC, components, options);
}

export function calculateComponentAmount(
  comp: RawSalaryComponent,
  monthlyCTC: number,
  allComponents: RawSalaryComponent[],
  options: ComponentAmountOptions = {}
): number {
  const code = comp.componentCode ?? "";

  if (isSpecialAllowanceCode(code)) {
    if (options.skipSpecialAllowance) return 0;
    return computeSpecialAllowanceBalance(monthlyCTC, allComponents, options);
  }

  if (isBasicComponent(comp)) {
    return resolveBasicSalaryAmount(monthlyCTC, allComponents, options);
  }

  const type = resolveEffectiveCalculationType(comp);
  const base = resolveEffectiveCalculationBase(comp);
  const val = getConfigValue(comp, options.valuesAreRupees);
  const basicSalary = resolveBasicSalaryForCalculation(monthlyCTC, allComponents, options);

  let amount = 0;

  if (isFixedType(type)) {
    amount = val;
  } else if (isPercentageOfBasic(type, base)) {
    amount = roundAmount((val / 100) * basicSalary);
  } else if (isPercentageOfGross(type, base)) {
    amount = roundAmount((val / 100) * monthlyCTC);
  } else if (type === "STATUTORY" || type === "FORMULA") {
    amount = calculateStatutoryComponent(comp, basicSalary);
  } else {
    amount = val;
  }

  return applyLimit(amount, comp);
}

export function calculateSpecialAllowance(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): SpecialAllowanceInfo {
  const calculatedAmount = computeSpecialAllowanceBalance(monthlyCTC, components, options ?? {});
  return { calculatedAmount, formula: SPECIAL_ALLOWANCE_FORMULA };
}

export function calculateEarnings(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): CalculatedComponentLine[] {
  const basicSalary = resolveBasicSalaryAmount(monthlyCTC, components, options);
  const sa = calculateSpecialAllowance(monthlyCTC, components, options);

  const calcOpts: ComponentAmountOptions = {
    ...options,
    skipSpecialAllowance: true,
    basicSalaryOverride: basicSalary,
  };

  const earnings = components
    .filter((c) => c.componentType === "EARNING" && !isSpecialAllowanceCode(c.componentCode))
    .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
    .map((c) => ({
      componentCode: c.componentCode,
      componentName: c.componentName ?? c.componentCode,
      componentType: "EARNING" as const,
      calculatedAmount: calculateComponentAmount(c, monthlyCTC, components, calcOpts),
      sequenceNo: c.sequenceNo,
    }));

  if (components.some((c) => isSpecialAllowanceCode(c.componentCode)) || sa.calculatedAmount >= 0) {
    earnings.push({
      componentCode: "SPECIAL_ALLOWANCE",
      componentName: "Special Allowance",
      componentType: "EARNING",
      calculatedAmount: sa.calculatedAmount,
      sequenceNo: 9999,
    });
  }

  return earnings;
}

export function calculateDeductions(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): CalculatedComponentLine[] {
  const basicSalary = resolveBasicSalaryAmount(monthlyCTC, components, options);
  const calcOpts: ComponentAmountOptions = {
    ...options,
    skipSpecialAllowance: true,
    basicSalaryOverride: basicSalary,
  };

  return components
    .filter((c) => c.componentType === "DEDUCTION")
    .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
    .map((c) => ({
      componentCode: c.componentCode,
      componentName: c.componentName ?? c.componentCode,
      componentType: "DEDUCTION" as const,
      calculatedAmount: calculateComponentAmount(c, monthlyCTC, components, calcOpts),
      sequenceNo: c.sequenceNo,
    }));
}

export function calculateEmployerContributions(
  monthlyCTC: number,
  components: RawSalaryComponent[],
  options?: { valuesAreRupees?: boolean }
): CalculatedComponentLine[] {
  const basicSalary = resolveBasicSalaryAmount(monthlyCTC, components, options);
  const calcOpts: ComponentAmountOptions = {
    ...options,
    skipSpecialAllowance: true,
    basicSalaryOverride: basicSalary,
  };

  return components
    .filter((c) => c.componentType === "EMPLOYER_CONTRIBUTION")
    .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
    .map((c) => ({
      componentCode: c.componentCode,
      componentName: c.componentName ?? c.componentCode,
      componentType: "EMPLOYER_CONTRIBUTION" as const,
      calculatedAmount: calculateComponentAmount(c, monthlyCTC, components, calcOpts),
      includeInCTC: isIncludedInCTC(c),
      sequenceNo: c.sequenceNo,
    }));
}

export function calculateGrossSalary(earnings: CalculatedComponentLine[]): number {
  return roundAmount(earnings.reduce((s, e) => s + e.calculatedAmount, 0));
}

export function calculateTotalDeductions(deductions: CalculatedComponentLine[]): number {
  return roundAmount(deductions.reduce((s, d) => s + d.calculatedAmount, 0));
}

export function calculateTotalEmployerContributions(
  employerContributions: CalculatedComponentLine[]
): number {
  return roundAmount(employerContributions.reduce((s, e) => s + e.calculatedAmount, 0));
}

export function calculateEmployerContributionsInCTC(
  employerContributions: CalculatedComponentLine[]
): number {
  return roundAmount(
    employerContributions
      .filter((e) => e.includeInCTC !== false)
      .reduce((s, e) => s + e.calculatedAmount, 0)
  );
}

export function calculateNetSalary(grossSalary: number, totalDeductions: number): number {
  return roundAmount(sanitizeAmount(grossSalary) - sanitizeAmount(totalDeductions));
}

export function calculateEffectiveCTC(
  grossSalary: number,
  totalEmployerContributions: number
): number {
  return roundAmount(grossSalary + totalEmployerContributions);
}

export function calculateMonthlyCTC(annualCTCRupees: number): number {
  return roundAmount(annualCTCRupees / 12);
}

export function calculateAnnualCTC(monthlyCTCRupees: number): number {
  return roundAmount(monthlyCTCRupees * 12);
}

export function calculateSalaryBreakdown(
  options: CalculateBreakdownOptions & { valuesAreRupees?: boolean }
): SalaryBreakdown {
  const { valuesAreRupees } = options;
  const validated = validateBeforeCalculation(options.monthlyCTC, options.components);
  if (validated.warnings.length > 0) {
    validated.warnings.forEach((w) => console.warn(`[salaryCalculationEngine] ${w}`));
  }
  const monthlyCTC = validated.monthlyCTC;
  const components = validated.components;

  const basicSalary = resolveBasicSalaryAmount(monthlyCTC, components, { valuesAreRupees });
  const specialAllowance = calculateSpecialAllowance(monthlyCTC, components, { valuesAreRupees });
  const earnings = calculateEarnings(monthlyCTC, components, { valuesAreRupees });
  const deductions = calculateDeductions(monthlyCTC, components, { valuesAreRupees });
  const employerContributions = calculateEmployerContributions(monthlyCTC, components, {
    valuesAreRupees,
  });

  const grossSalary = calculateGrossSalary(earnings);
  const totalDeductions = calculateTotalDeductions(deductions);
  const totalEmployerContributions = calculateTotalEmployerContributions(employerContributions);

  return {
    monthlyCTC,
    annualCTC: calculateAnnualCTC(monthlyCTC),
    basicSalary,
    earnings,
    specialAllowance,
    deductions,
    employerContributions,
    totalEarnings: grossSalary,
    grossSalary,
    totalDeductions,
    netSalary: calculateNetSalary(grossSalary, totalDeductions),
    totalEmployerContributions,
    employerContributionsInCTC: calculateEmployerContributionsInCTC(employerContributions),
    effectiveCTC: calculateEffectiveCTC(grossSalary, totalEmployerContributions),
  };
}

function mapStructureRowToApi(
  calcType: string
): { calculationType: string; calculationBase: string | null } {
  if (calcType === "Statutory") {
    return { calculationType: "STATUTORY", calculationBase: null };
  }
  return mapUIStructureToApi(calcType as UIStructureCalculationType);
}

export function structureFormToRawComponents(input: {
  earnings: StructureEarningRow[];
  employerContributions: StructureEmployerRow[];
  deductions: StructureDeductionRow[];
  specialAllowanceId?: string;
}): RawSalaryComponent[] {
  const components: RawSalaryComponent[] = [];

  input.earnings
    .filter((e) => e.name && e.name !== "Special Allowance")
    .forEach((e, idx) => {
      const { calculationType, calculationBase } = mapUIStructureToApi(e.calculationType);
      components.push({
        id: e.id,
        componentCode: normalizeBasicComponentCode(e.name),
        componentName: e.name,
        componentType: "EARNING",
        calculationType,
        overrideCalculationType: calculationType,
        calculationBase,
        overrideCalculationBase: calculationBase,
        calculationValue: e.value,
        sequenceNo: idx + 1,
      });
    });

  components.push({
    id: input.specialAllowanceId,
    componentCode: "SPECIAL_ALLOWANCE",
    componentName: "Special Allowance",
    componentType: "EARNING",
    calculationType: "FORMULA",
    overrideCalculationType: "FORMULA",
    sequenceNo: input.earnings.length + 1,
  });

  input.employerContributions.forEach((ec, idx) => {
    const { calculationType, calculationBase } = mapStructureRowToApi(ec.calculationType);
    components.push({
      id: ec.id,
      componentCode: normalizeBasicComponentCode(ec.name),
      componentName: ec.name,
      componentType: "EMPLOYER_CONTRIBUTION",
      calculationType,
      overrideCalculationType: calculationType,
      calculationBase,
      overrideCalculationBase: calculationBase,
      calculationValue: ec.calculationType === "Formula" ? null : ec.value,
      includeInCtc: ec.includeInCTC,
      includeInCTC: ec.includeInCTC,
      sequenceNo: 100 + idx,
    });
  });

  input.deductions.forEach((d, idx) => {
    const { calculationType, calculationBase } = mapStructureRowToApi(d.calculationType);
    components.push({
      id: d.id,
      componentCode: normalizeBasicComponentCode(d.name),
      componentName: d.name,
      componentType: "DEDUCTION",
      calculationType,
      overrideCalculationType: calculationType,
      calculationBase,
      overrideCalculationBase: calculationBase,
      calculationValue: d.value,
      sequenceNo: 200 + idx,
    });
  });

  return components;
}

export function calculateStructureFormBreakdown(
  monthlyCTC: number,
  earnings: StructureEarningRow[],
  employerContributions: StructureEmployerRow[],
  deductions: StructureDeductionRow[],
  specialAllowanceId?: string
) {
  const raw = structureFormToRawComponents({
    earnings,
    employerContributions,
    deductions,
    specialAllowanceId,
  });
  const breakdown = calculateSalaryBreakdown({
    monthlyCTC,
    components: raw,
    valuesAreRupees: true,
  });

  const updatedEarnings = earnings.map((e) => {
    const line = breakdown.earnings.find(
      (l) =>
        l.componentName === e.name ||
        l.componentCode === normalizeBasicComponentCode(e.name)
    );
    let displayValue = "";
    if (e.calculationType === "Fixed") {
      displayValue = `₹${e.value.toLocaleString("en-IN")} fixed`;
    } else if (e.calculationType === "Percentage of Basic") {
      displayValue = `${e.value}% of Basic`;
    } else {
      displayValue = `${e.value}% of Gross`;
    }
    return { ...e, calculatedAmount: line?.calculatedAmount ?? 0, displayValue };
  });

  const updatedEmployer = employerContributions.map((ec) => {
    const line = breakdown.employerContributions.find((l) => l.componentName === ec.name);
    return { ...ec, calculatedAmount: line?.calculatedAmount ?? 0 };
  });

  const updatedDeductions = deductions.map((d) => {
    const line = breakdown.deductions.find((l) => l.componentName === d.name);
    let displayText = "";
    if (d.calculationType === "Fixed") {
      displayText = `₹${d.value.toLocaleString("en-IN")} fixed`;
    } else if (d.calculationType === "Statutory") {
      displayText = `${d.value}% statutory`;
    } else {
      displayText = `${d.value}% of Basic`;
    }
    return { ...d, calculatedAmount: line?.calculatedAmount ?? 0, displayText };
  });

  return {
    breakdown,
    earnings: updatedEarnings,
    deductions: updatedDeductions,
    employerContributions: updatedEmployer,
  };
}

export function buildEmployeeComponentRows(
  rawComps: RawSalaryComponent[],
  monthlyCTCRupees: number
): EmployeeSalaryComponentRow[] {
  const breakdown = calculateSalaryBreakdown({ monthlyCTC: monthlyCTCRupees, components: rawComps });
  const amountByCode = new Map<string, number>();
  [...breakdown.earnings, ...breakdown.deductions, ...breakdown.employerContributions].forEach(
    (line) => amountByCode.set(line.componentCode, line.calculatedAmount)
  );

  return [...rawComps]
    .sort((a, b) => (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0))
    .map((comp) => {
      const code = comp.componentCode ?? "";
      const amount = amountByCode.get(code) ?? 0;
      const isLocked = LOCKED_COMPONENT_CODES.includes(
        code as (typeof LOCKED_COMPONENT_CODES)[number]
      );

      return {
        id: typeof comp.id === "number" ? comp.id : Number(comp.id) || Math.random(),
        componentId: comp.componentId ?? null,
        componentCode: code,
        componentName: comp.componentName ?? "",
        componentType: comp.componentType ?? "EARNING",
        calculationType: comp.calculationType || comp.overrideCalculationType || "",
        overrideCalculationType: comp.overrideCalculationType || "",
        overrideCalculationBase: comp.overrideCalculationBase || comp.calculationBase || "",
        sequenceNo: comp.sequenceNo ?? 0,
        finalContractualAmount: amount,
        finalAnnualAmount: amount * 12,
        structureCalculatedAmount: amount,
        structureCalculatedAnnualAmount: amount * 12,
        isManualOverride: false,
        editable: comp.editable ?? comp.overrideAllowed ?? !isLocked,
        removable: comp.removable ?? !(comp.isMandatory ?? isLocked),
        overrideMaximumLimit: getMaxLimitRupees(comp),
      };
    });
}

export function recalculateEmployeeRowsWithOverrides(
  rows: EmployeeSalaryComponentRow[],
  rawComps: RawSalaryComponent[],
  monthlyCTCRupees: number
): EmployeeSalaryComponentRow[] {
  const fresh = buildEmployeeComponentRows(rawComps, monthlyCTCRupees);
  const freshByCode = new Map(fresh.map((r) => [r.componentCode, r]));

  return rows.map((row) => {
    const calculated = freshByCode.get(row.componentCode);
    if (!calculated) return row;

    const raw = rawComps.find((c) => c.componentCode === row.componentCode);
    const limit = raw ? getMaxLimitRupees(raw) : row.overrideMaximumLimit ?? null;

    if (row.isManualOverride) {
      let overrideAmt = row.finalContractualAmount;
      if (limit !== null && overrideAmt > limit) overrideAmt = limit;
      return {
        ...row,
        structureCalculatedAmount: calculated.structureCalculatedAmount,
        structureCalculatedAnnualAmount: calculated.structureCalculatedAnnualAmount,
        finalContractualAmount: overrideAmt,
        finalAnnualAmount: overrideAmt * 12,
        calculationType: calculated.calculationType,
        overrideCalculationType: calculated.overrideCalculationType,
        overrideCalculationBase: calculated.overrideCalculationBase,
      };
    }
    return calculated;
  });
}

export function mapApiEmployeeComponentToRow(
  comp: Record<string, unknown>,
  monthlyCTCRupees: number,
  rawComps: RawSalaryComponent[],
  precomputedRows?: EmployeeSalaryComponentRow[]
): EmployeeSalaryComponentRow {
  const code = String(comp.componentCode ?? "");
  const rows = precomputedRows ?? buildEmployeeComponentRows(rawComps, monthlyCTCRupees);
  const calculated = rows.find((r) => r.componentCode === code);
  const structureCalculated = paiseToRupees(
    Number(comp.structureCalculatedAmount ?? comp.finalContractualAmount ?? 0)
  );
  const finalContractual = paiseToRupees(Number(comp.finalContractualAmount ?? 0));
  const isLocked = LOCKED_COMPONENT_CODES.includes(
    code as (typeof LOCKED_COMPONENT_CODES)[number]
  );

  return {
    id: Number(comp.id ?? Math.random()),
    componentId: (comp.componentId as number) ?? null,
    componentCode: code,
    componentName: String(comp.componentName ?? ""),
    componentType: String(comp.componentType ?? "EARNING"),
    calculationType: String(comp.calculationType ?? comp.overrideCalculationType ?? ""),
    overrideCalculationType: String(comp.overrideCalculationType ?? ""),
    overrideCalculationBase: String(comp.overrideCalculationBase ?? ""),
    sequenceNo: Number(comp.sequenceNo ?? 0),
    finalContractualAmount: finalContractual,
    finalAnnualAmount: paiseToRupees(Number(comp.finalAnnualAmount ?? 0)),
    structureCalculatedAmount: structureCalculated || calculated?.structureCalculatedAmount || 0,
    structureCalculatedAnnualAmount:
      paiseToRupees(Number(comp.structureCalculatedAnnualAmount ?? 0)) ||
      (structureCalculated || 0) * 12,
    isManualOverride:
      Boolean(comp.isManualOverride) || Math.abs(structureCalculated - finalContractual) > 0.01,
    editable: !isLocked,
    removable: !isLocked,
    overrideMaximumLimit:
      comp.overrideMaximumLimit != null ? paiseToRupees(Number(comp.overrideMaximumLimit)) : null,
  };
}

export function getDefaultValueForCalculationTypeTransition(
  newType: string,
  masterValue?: number
): number {
  if (masterValue != null && masterValue >= 0) {
    if (newType === "Fixed" || newType === "FIXED") return masterValue;
    if (newType.includes("Percentage") || newType.includes("PERCENTAGE")) {
      return masterValue <= 100 ? masterValue : 10;
    }
  }
  if (newType === "Fixed") return CALC_TYPE_DEFAULTS.Fixed;
  if (newType === "Percentage of Basic") return CALC_TYPE_DEFAULTS["Percentage of Basic"];
  if (newType === "Percentage of Gross") return CALC_TYPE_DEFAULTS["Percentage of Gross"];
  return 0;
}

export function mergeStructureComponentsWithMaster(
  structureComponents: RawSalaryComponent[],
  masterComponents: RawSalaryComponent[]
): RawSalaryComponent[] {
  return structureComponents.map((comp) => {
    const master = masterComponents.find((m) => m.componentCode === comp.componentCode);
    return {
      ...master,
      ...comp,
      componentCode: comp.componentCode ?? master?.componentCode ?? "",
      componentName: comp.componentName ?? master?.componentName,
      overrideCalculationBase:
        comp.overrideCalculationBase ?? comp.calculationBase ?? master?.overrideCalculationBase,
      overrideCalculationType:
        comp.overrideCalculationType ?? comp.calculationType ?? master?.overrideCalculationType,
      calculationType:
        comp.overrideCalculationType ?? comp.calculationType ?? master?.calculationType,
      calculationValue: comp.calculationValue ?? master?.calculationValue ?? 0,
      overrideMaximumLimit: comp.overrideMaximumLimit ?? master?.overrideMaximumLimit ?? null,
      editable: master?.overrideAllowed ?? comp.overrideAllowed ?? true,
      removable: !(master?.isMandatory ?? comp.isMandatory ?? false),
    };
  });
}

export function breakdownFromApiEmployeeSalary(
  components: Array<Record<string, unknown>>,
  ctcAnnualPaise: number
): SalaryBreakdown {
  const safeCtcPaise = sanitizeAmount(ctcAnnualPaise);
  const monthlyCTC = sanitizeAmount(paiseToRupees(safeCtcPaise) / 12);
  const earnings: CalculatedComponentLine[] = [];
  const deductions: CalculatedComponentLine[] = [];
  const employerContributions: CalculatedComponentLine[] = [];

  components.forEach((comp) => {
    const rawAmount = Number(comp.finalContractualAmount ?? 0);
    if (rawAmount < 0) {
      console.warn(
        `[salaryCalculationEngine] Negative API amount for ${comp.componentName}: ${rawAmount}`
      );
    }
    const amount = sanitizeAmount(paiseToRupees(rawAmount));
    const line: CalculatedComponentLine = {
      componentCode: String(comp.componentCode ?? ""),
      componentName: String(comp.componentName ?? ""),
      componentType: String(comp.componentType ?? "EARNING"),
      calculatedAmount: amount,
    };
    if (comp.componentType === "EARNING") earnings.push(line);
    else if (comp.componentType === "DEDUCTION") deductions.push(line);
    else if (comp.componentType === "EMPLOYER_CONTRIBUTION") {
      employerContributions.push({ ...line, includeInCTC: true });
    }
  });

  const saLine = earnings.find((e) => isSpecialAllowanceCode(e.componentCode));
  const grossSalary = calculateGrossSalary(earnings);
  const totalDeductions = calculateTotalDeductions(deductions);
  const totalEmployerContributions = calculateTotalEmployerContributions(employerContributions);

  return {
    monthlyCTC,
    annualCTC: sanitizeAmount(paiseToRupees(safeCtcPaise)),
    basicSalary: earnings.find((e) => isBasicComponent({ componentCode: e.componentCode }))?.calculatedAmount ?? 0,
    earnings,
    specialAllowance: {
      calculatedAmount: sanitizeAmount(saLine?.calculatedAmount ?? 0),
      formula: SPECIAL_ALLOWANCE_FORMULA,
    },
    deductions,
    employerContributions,
    totalEarnings: grossSalary,
    grossSalary,
    totalDeductions,
    netSalary: calculateNetSalary(grossSalary, totalDeductions),
    totalEmployerContributions,
    employerContributionsInCTC: totalEmployerContributions,
    effectiveCTC: calculateEffectiveCTC(grossSalary, totalEmployerContributions),
  };
}

export function apiComponentToRaw(comp: Record<string, unknown>): RawSalaryComponent {
  return {
    id: comp.id as number | string,
    componentCode: String(comp.componentCode ?? ""),
    componentName: String(comp.componentName ?? ""),
    componentType: String(comp.componentType ?? "EARNING"),
    calculationType: String(comp.calculationType ?? ""),
    overrideCalculationType: String(comp.overrideCalculationType ?? comp.calculationType ?? ""),
    calculationBase: comp.calculationBase as string | null,
    overrideCalculationBase: (comp.overrideCalculationBase ?? comp.calculationBase) as string | null,
    calculationValue: comp.calculationValue as number | null,
    formula: comp.formula as string | null,
    includeInCtc: comp.includeInCtc as boolean,
    includeInCTC: comp.includeInCTC as boolean,
    sequenceNo: Number(comp.sequenceNo ?? 0),
    overrideMaximumLimit: comp.overrideMaximumLimit as number | null,
  };
}

export function mapApiComponentValueToUiRupees(comp: {
  calculationType?: string;
  overrideCalculationType?: string;
  calculationValue?: number | null;
}): number {
  const type = resolveEffectiveCalculationType(comp);
  return mapApiCalculationValueToUi(type, comp.calculationValue ?? 0);
}
