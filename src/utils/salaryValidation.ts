import type {
  RawSalaryComponent,
  SalaryBreakdown,
  SalaryValidationResult,
  StructureDeductionRow,
  StructureEarningRow,
  StructureEmployerRow,
  EmployeeSalaryComponentRow,
} from "./salaryTypes.ts";
import {
  MAX_PERCENTAGE,
  BASIC_PERCENTAGE_OF_BASIC_ERROR,
  ERROR_AMOUNT_NEGATIVE,
  ERROR_PERCENTAGE_NEGATIVE,
  ERROR_PERCENTAGE_EXCEEDS,
  ERROR_CTC_NEGATIVE,
  ERROR_SPECIAL_ALLOWANCE_NEGATIVE,
} from "./salaryConstants.ts";
import {
  isBasicComponent,
  resolveEffectiveCalculationType,
  resolveEffectiveCalculationBase,
  mapApiCalculationValueToUi,
  paiseToRupees,
} from "./salaryHelpers.ts";

export interface FieldValidationResult {
  valid: boolean;
  error: string | null;
  sanitized: number;
}

function isPercentageOfBasicType(type: string, base: string | null): boolean {
  return type === "PERCENTAGE_OF_BASIC" || (type === "PERCENTAGE" && base === "PERCENTAGE_OF_BASIC");
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function logSanitizeWarning(fieldName: string, original: unknown, sanitized: number): void {
  if (original !== sanitized) {
    console.warn(
      `[salaryValidation] Sanitized invalid API value for "${fieldName}": ${original} → ${sanitized}`
    );
  }
}

/** Clamp monetary value to >= 0 */
export function sanitizeAmount(value: number | null | undefined): number {
  const num = toNumber(value);
  if (num < 0) return 0;
  return num;
}

/** Clamp percentage to 0–100 */
export function sanitizePercentage(value: number | null | undefined): number {
  const num = toNumber(value);
  if (num < 0) return 0;
  if (num > MAX_PERCENTAGE) return MAX_PERCENTAGE;
  return num;
}

/** Sanitize API monetary value (paise or rupees) — logs warning if negative */
export function sanitizeApiAmount(value: unknown, fieldName = "amount"): number {
  const num = toNumber(value);
  const sanitized = sanitizeAmount(num);
  if (num < 0) logSanitizeWarning(fieldName, num, sanitized);
  return sanitized;
}

/** Sanitize API percentage — logs warning if out of range */
export function sanitizeApiPercentage(value: unknown, fieldName = "percentage"): number {
  const num = toNumber(value);
  const sanitized = sanitizePercentage(num);
  if (num < 0 || num > MAX_PERCENTAGE) logSanitizeWarning(fieldName, num, sanitized);
  return sanitized;
}

export function validateAmount(
  value: number,
  fieldName = "Amount"
): FieldValidationResult {
  const sanitized = sanitizeAmount(value);
  if (value < 0) {
    return { valid: false, error: ERROR_AMOUNT_NEGATIVE, sanitized };
  }
  return { valid: true, error: null, sanitized };
}

export function validatePercentage(value: number): FieldValidationResult {
  const sanitized = sanitizePercentage(value);
  if (value < 0) {
    return { valid: false, error: ERROR_PERCENTAGE_NEGATIVE, sanitized };
  }
  if (value > MAX_PERCENTAGE) {
    return { valid: false, error: ERROR_PERCENTAGE_EXCEEDS, sanitized };
  }
  return { valid: true, error: null, sanitized };
}

export function validateCTC(monthlyCTC: number, annualCTC?: number): SalaryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (monthlyCTC < 0) errors.push(ERROR_CTC_NEGATIVE);
  if (annualCTC != null && annualCTC < 0) errors.push("Annual CTC cannot be negative.");

  return { valid: errors.length === 0, errors, warnings };
}

export function isPercentageCalculationType(calcType: string): boolean {
  return (
    calcType === "Percentage of Basic" ||
    calcType === "Percentage of Gross" ||
    calcType.includes("PERCENTAGE") ||
    calcType === "PERCENTAGE"
  );
}

/** Sanitize component input based on Fixed vs Percentage calculation type */
export function sanitizeComponentInputValue(calcType: string, value: number): number {
  if (isPercentageCalculationType(calcType)) {
    return sanitizePercentage(value);
  }
  return sanitizeAmount(value);
}

/** Strip invalid characters from amount input — digits only (no -, +, e) */
export function parseAmountInputString(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

/** Strip invalid chars; allow one decimal for percentages */
export function parsePercentageInputString(raw: string): string {
  let cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
}

/** Parse and clamp amount from string input */
export function parseAndSanitizeAmountInput(raw: string): number {
  const parsed = parseAmountInputString(raw);
  return sanitizeAmount(Number(parsed) || 0);
}

/** Parse and clamp percentage from string input */
export function parseAndSanitizePercentageInput(raw: string): number {
  const parsed = parsePercentageInputString(raw);
  return sanitizePercentage(Number(parsed) || 0);
}

/** Basic must never be calculated as % of Basic */
export function isBasicPercentageOfBasicInvalid(comp: RawSalaryComponent): boolean {
  if (!isBasicComponent(comp)) return false;
  const type = resolveEffectiveCalculationType(comp);
  const base = resolveEffectiveCalculationBase(comp);
  return isPercentageOfBasicType(type, base);
}

export function validateBasicSalaryRule(comp: RawSalaryComponent): string | null {
  if (isBasicPercentageOfBasicInvalid(comp)) {
    return BASIC_PERCENTAGE_OF_BASIC_ERROR;
  }
  return null;
}

export function validateSalaryComponent(comp: RawSalaryComponent): string | null {
  const basicError = validateBasicSalaryRule(comp);
  if (basicError) return basicError;

  const type = resolveEffectiveCalculationType(comp);
  const base = resolveEffectiveCalculationBase(comp);
  const rawVal = comp.calculationValue ?? 0;

  if (type === "FIXED") {
    const uiVal = mapApiCalculationValueToUi("FIXED", rawVal);
    if (uiVal < 0) return `${comp.componentName ?? comp.componentCode}: ${ERROR_AMOUNT_NEGATIVE}`;
  } else if (
    isPercentageOfBasicType(type, base) ||
    type === "PERCENTAGE_OF_GROSS" ||
    (type === "PERCENTAGE" && base !== null)
  ) {
    const pct = toNumber(rawVal);
    if (pct < 0) return `${comp.componentName ?? comp.componentCode}: ${ERROR_PERCENTAGE_NEGATIVE}`;
    if (pct > MAX_PERCENTAGE) {
      return `${comp.componentName ?? comp.componentCode}: ${ERROR_PERCENTAGE_EXCEEDS}`;
    }
  }

  return null;
}

export function validateSalaryComponents(components: RawSalaryComponent[]): SalaryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const comp of components) {
    const err = validateSalaryComponent(comp);
    if (err) errors.push(err);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateStructureEarnings(earnings: StructureEarningRow[]): SalaryValidationResult {
  const errors: string[] = [];

  for (const e of earnings) {
    const isBasic =
      e.name === "Basic Salary" || e.name === "Basic" || e.name.toLowerCase().includes("basic salary");
    if (isBasic && e.calculationType === "Percentage of Basic") {
      errors.push(BASIC_PERCENTAGE_OF_BASIC_ERROR);
    }
    if (e.calculationType === "Fixed") {
      if (e.value < 0) errors.push(`${e.name}: ${ERROR_AMOUNT_NEGATIVE}`);
    } else {
      const pct = validatePercentage(e.value);
      if (!pct.valid && pct.error) errors.push(`${e.name}: ${pct.error}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateStructureDeductions(deductions: StructureDeductionRow[]): SalaryValidationResult {
  const errors: string[] = [];
  for (const d of deductions) {
    if (d.calculationType === "Fixed") {
      if (d.value < 0) errors.push(`${d.name}: ${ERROR_AMOUNT_NEGATIVE}`);
    } else {
      const pct = validatePercentage(d.value);
      if (!pct.valid && pct.error) errors.push(`${d.name}: ${pct.error}`);
    }
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateStructureEmployerContributions(
  rows: StructureEmployerRow[]
): SalaryValidationResult {
  const errors: string[] = [];
  for (const ec of rows) {
    if (ec.calculationType === "Formula") continue;
    if (ec.calculationType === "Fixed") {
      if (ec.value < 0) errors.push(`${ec.name}: ${ERROR_AMOUNT_NEGATIVE}`);
    } else {
      const pct = validatePercentage(ec.value);
      if (!pct.valid && pct.error) errors.push(`${ec.name}: ${pct.error}`);
    }
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateSalaryStructure(input: {
  structureName?: string;
  structureCode?: string;
  minMonthlySalary?: number;
  maxMonthlySalary?: number;
  monthlyCTC?: number;
  annualCTC?: number;
  earnings?: StructureEarningRow[];
  deductions?: StructureDeductionRow[];
  employerContributions?: StructureEmployerRow[];
  breakdown?: SalaryBreakdown;
}): SalaryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.structureName?.trim()) errors.push("Structure name is required.");
  if (!input.structureCode?.trim()) errors.push("Structure code is required.");

  if ((input.minMonthlySalary ?? 0) < 0) errors.push("Minimum monthly salary cannot be negative.");
  if ((input.maxMonthlySalary ?? 0) < 0) errors.push("Maximum monthly salary cannot be negative.");
  if (
    input.minMonthlySalary != null &&
    input.maxMonthlySalary != null &&
    input.maxMonthlySalary > 0 &&
    input.minMonthlySalary > input.maxMonthlySalary
  ) {
    errors.push("Minimum monthly salary cannot exceed maximum monthly salary.");
  }

  const ctcValidation = validateCTC(input.monthlyCTC ?? 0, input.annualCTC);
  errors.push(...ctcValidation.errors);

  if (input.earnings) {
    const ev = validateStructureEarnings(input.earnings);
    errors.push(...ev.errors);
  }
  if (input.deductions) {
    const dv = validateStructureDeductions(input.deductions);
    errors.push(...dv.errors);
  }
  if (input.employerContributions) {
    const ev = validateStructureEmployerContributions(input.employerContributions);
    errors.push(...ev.errors);
  }
  if (input.breakdown) {
    const bv = validateCTCBreakup(input.breakdown);
    errors.push(...bv.errors);
    warnings.push(...bv.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateEmployeeSalaryForm(input: {
  monthlyCTC: number;
  components: EmployeeSalaryComponentRow[];
  rawComponents: RawSalaryComponent[];
  breakdown?: SalaryBreakdown;
}): SalaryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ctc = validateCTC(input.monthlyCTC, input.monthlyCTC * 12);
  errors.push(...ctc.errors);

  if (input.monthlyCTC <= 0) errors.push("Monthly CTC must be greater than zero.");

  const compValidation = validateSalaryComponents(input.rawComponents);
  errors.push(...compValidation.errors);

  for (const row of input.components) {
    if (row.finalContractualAmount < 0) {
      errors.push(`${row.componentName}: ${ERROR_AMOUNT_NEGATIVE}`);
    }
    if (row.structureCalculatedAmount < 0) {
      errors.push(`${row.componentName} calculated amount is negative.`);
    }
  }

  if (input.breakdown) {
    const bv = validateCTCBreakup(input.breakdown);
    errors.push(...bv.errors);
    warnings.push(...bv.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCTCBreakup(breakdown: SalaryBreakdown): SalaryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (breakdown.monthlyCTC < 0) errors.push(ERROR_CTC_NEGATIVE);
  if (breakdown.annualCTC < 0) errors.push("Annual CTC cannot be negative.");
  if (breakdown.basicSalary < 0) errors.push("Basic Salary cannot be negative.");
  if (breakdown.grossSalary < 0) errors.push("Gross Salary cannot be negative.");
  if (breakdown.netSalary < 0) errors.push("Net Salary cannot be negative.");
  if (breakdown.totalDeductions < 0) errors.push("Deductions cannot be negative.");
  if (breakdown.totalEmployerContributions < 0) {
    errors.push("Employer Contributions cannot be negative.");
  }
  if (breakdown.specialAllowance.calculatedAmount < 0) {
    errors.push(ERROR_SPECIAL_ALLOWANCE_NEGATIVE);
  }

  for (const e of breakdown.earnings) {
    if (e.calculatedAmount < 0) errors.push(`${e.componentName}: ${ERROR_AMOUNT_NEGATIVE}`);
  }
  for (const d of breakdown.deductions) {
    if (d.calculatedAmount < 0) errors.push(`${d.componentName}: ${ERROR_AMOUNT_NEGATIVE}`);
  }
  for (const ec of breakdown.employerContributions) {
    if (ec.calculatedAmount < 0) errors.push(`${ec.componentName}: ${ERROR_AMOUNT_NEGATIVE}`);
  }

  if (breakdown.basicSalary <= 0) {
    warnings.push("Basic Salary is zero — check component configuration.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validatePercentageValue(value: number, fieldName: string): string | null {
  if (value < 0) return ERROR_PERCENTAGE_NEGATIVE.replace("Percentage", fieldName);
  if (value > MAX_PERCENTAGE) return `${fieldName} cannot exceed ${MAX_PERCENTAGE}%.`;
  return null;
}

export function validateCalculationTypeTransition(
  oldType: string,
  newType: string,
  currentValue: number,
  componentName?: string
): { resetValue: number; warning?: string; error?: string } {
  const isBasic =
    componentName === "Basic Salary" ||
    componentName === "Basic" ||
    (componentName ?? "").toLowerCase().includes("basic salary");

  if (isBasic && newType === "Percentage of Basic") {
    return { resetValue: 40, error: BASIC_PERCENTAGE_OF_BASIC_ERROR };
  }

  const isOldFixed = oldType === "Fixed" || oldType === "FIXED";
  const isNewFixed = newType === "Fixed" || newType === "FIXED";
  const isOldPct = oldType.includes("Percentage") || oldType.includes("PERCENTAGE");
  const isNewPct = newType.includes("Percentage") || newType.includes("PERCENTAGE");

  if (isOldFixed && isNewPct && currentValue > MAX_PERCENTAGE) {
    return {
      resetValue: 10,
      warning:
        "Fixed amount reset to percentage default because previous value was not a valid percentage.",
    };
  }
  if (isOldPct && isNewFixed) {
    return { resetValue: 0 };
  }
  if (isOldPct && isNewPct) {
    return { resetValue: sanitizePercentage(currentValue) };
  }
  return { resetValue: sanitizeComponentInputValue(newType, currentValue) };
}

/** Sanitize raw component from API before entering state */
export function sanitizeApiRawComponent(comp: Record<string, unknown>): RawSalaryComponent {
  const type = String(comp.overrideCalculationType ?? comp.calculationType ?? "FIXED").toUpperCase();
  const base = (comp.overrideCalculationBase ?? comp.calculationBase) as string | null;
  let calculationValue = comp.calculationValue;

  if (type === "FIXED") {
    const uiVal = mapApiCalculationValueToUi("FIXED", toNumber(calculationValue));
    calculationValue = sanitizeApiAmount(uiVal, String(comp.componentName ?? comp.componentCode));
  } else if (
    isPercentageOfBasicType(type, base) ||
    type === "PERCENTAGE_OF_GROSS" ||
    type === "PERCENTAGE"
  ) {
    calculationValue = sanitizeApiPercentage(calculationValue, String(comp.componentName));
  }

  const overrideMaximumLimit =
    comp.overrideMaximumLimit != null
      ? sanitizeApiAmount(paiseToRupees(toNumber(comp.overrideMaximumLimit)), "overrideMaximumLimit")
      : null;

  return {
    ...(comp as RawSalaryComponent),
    calculationValue: calculationValue as number | null,
    overrideMaximumLimit,
  };
}

export function sanitizeApiRawComponents(components: Record<string, unknown>[]): RawSalaryComponent[] {
  return components.map(sanitizeApiRawComponent);
}

/** Prepare inputs for calculation engine — sanitize CTC and component config values */
export function validateBeforeCalculation(
  monthlyCTC: number,
  components: RawSalaryComponent[]
): { monthlyCTC: number; components: RawSalaryComponent[]; warnings: string[] } {
  const warnings: string[] = [];
  const safeMonthlyCTC = sanitizeAmount(monthlyCTC);
  if (monthlyCTC < 0) warnings.push(ERROR_CTC_NEGATIVE);

  const safeComponents = components.map((comp) => {
    const type = resolveEffectiveCalculationType(comp);
    const base = resolveEffectiveCalculationBase(comp);
    const rawVal = comp.calculationValue ?? 0;

    let safeVal = rawVal;
    if (type === "FIXED") {
      safeVal = sanitizeAmount(toNumber(rawVal));
    } else if (
      isPercentageOfBasicType(type, base) ||
      type === "PERCENTAGE_OF_GROSS" ||
      type === "PERCENTAGE"
    ) {
      safeVal = sanitizePercentage(toNumber(rawVal));
    }

    return { ...comp, calculationValue: safeVal };
  });

  return { monthlyCTC: safeMonthlyCTC, components: safeComponents, warnings };
}
