/** Shared salary domain types — single source for all salary/payroll pages. */

export type ComponentType = "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION";

export type ApiCalculationType =
  | "FIXED"
  | "PERCENTAGE"
  | "PERCENTAGE_OF_BASIC"
  | "PERCENTAGE_OF_GROSS"
  | "STATUTORY"
  | "FORMULA";

export type UIStructureCalculationType =
  | "Fixed"
  | "Percentage of Basic"
  | "Percentage of Gross"
  | "Formula";

export interface RawSalaryComponent {
  id?: number | string;
  componentId?: number | null;
  componentCode: string;
  componentName?: string;
  componentType: ComponentType | string;
  calculationType?: string;
  overrideCalculationType?: string;
  calculationBase?: string | null;
  overrideCalculationBase?: string | null;
  calculationValue?: number | null;
  formula?: string | null;
  includeInCtc?: boolean;
  includeInCTC?: boolean;
  sequenceNo?: number;
  overrideMaximumLimit?: number | null;
  isMandatory?: boolean;
  overrideAllowed?: boolean;
  editable?: boolean;
  removable?: boolean;
}

export interface StructureEarningRow {
  id: string;
  name: string;
  calculationType: "Fixed" | "Percentage of Basic" | "Percentage of Gross";
  value: number;
  displayValue?: string;
  calculatedAmount?: number;
}

export interface StructureEmployerRow {
  id: string;
  name: string;
  calculationType: "Fixed" | "Percentage of Basic" | "Formula" | "Statutory";
  value: number;
  calculatedAmount?: number;
  includeInCTC: boolean;
}

export interface StructureDeductionRow {
  id: string;
  name: string;
  calculationType: "Fixed" | "Percentage of Basic" | "Statutory";
  value: number;
  calculatedAmount?: number;
  displayText?: string;
}

export interface SpecialAllowanceInfo {
  id?: string;
  calculatedAmount: number;
  formula: string;
}

export interface CalculatedComponentLine {
  componentCode: string;
  componentName: string;
  componentType: ComponentType | string;
  calculatedAmount: number;
  displayText?: string;
  includeInCTC?: boolean;
  sequenceNo?: number;
}

export interface SalaryBreakdown {
  monthlyCTC: number;
  annualCTC: number;
  basicSalary: number;
  earnings: CalculatedComponentLine[];
  specialAllowance: SpecialAllowanceInfo;
  deductions: CalculatedComponentLine[];
  employerContributions: CalculatedComponentLine[];
  totalEarnings: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  totalEmployerContributions: number;
  employerContributionsInCTC: number;
  effectiveCTC: number;
}

export interface EmployeeSalaryComponentRow {
  id: number;
  componentId: number | null;
  componentCode: string;
  componentName: string;
  componentType: ComponentType | string;
  calculationType: string;
  overrideCalculationType?: string;
  overrideCalculationBase?: string;
  sequenceNo: number;
  finalContractualAmount: number;
  finalAnnualAmount: number;
  structureCalculatedAmount: number;
  structureCalculatedAnnualAmount: number;
  isManualOverride: boolean;
  editable?: boolean;
  removable?: boolean;
  overrideMaximumLimit?: number | null;
}

export interface SalaryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PayrollEmployeeSummary {
  employeeId: number | string;
  employeeCode?: string;
  employeeName?: string;
  monthlyCTC: number;
  annualCTC: number;
  grossPayout: number;
  totalDeduction: number;
  netPay: number;
  salaryStructureName?: string;
}

export interface PayrollSummary {
  grossPayout: number;
  deductions: number;
  netPayout: number;
  employeeCount: number;
  totalCtc: number;
}
