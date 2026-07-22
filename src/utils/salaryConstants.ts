/** Salary domain constants */

export const SPECIAL_ALLOWANCE_CODES = ["SPECIAL", "SPECIAL_ALLOWANCE"] as const;

export const LOCKED_COMPONENT_CODES = [
  "BASIC",
  "HRA",
  "SPECIAL",
  "SPECIAL_ALLOWANCE",
] as const;

export const BASIC_COMPONENT_CODES = ["BASIC", "BASIC_SALARY"] as const;

export const DEFAULT_BASIC_PERCENT_OF_GROSS = 40;

export const PF_EMPLOYER_RATE = 0.12;
export const PF_EMPLOYER_CAP = 1800;
export const GRATUITY_RATE = 0.0481;

export const PF_EMPLOYER_NAME_PATTERNS = [
  "PF Employer Contribution",
  "PF Employer",
  "EMPLOYER_PF",
  "PF_EMPLOYER",
];

export const GRATUITY_NAME_PATTERNS = [
  "Employer Gratuity Provision",
  "Gratuity",
  "GRATUITY",
  "EMPLOYER_GRATUITY",
];

export const SPECIAL_ALLOWANCE_FORMULA =
  "Monthly CTC minus all other earnings minus employer contributions included in CTC";

export const BASIC_PERCENTAGE_OF_BASIC_ERROR =
  "Basic Salary cannot use Percentage of Basic — it would cause circular calculation.";

export const DEFAULT_EARNING_ROWS = [
  {
    name: "Basic Salary",
    calculationType: "Percentage of Gross" as const,
    value: 40,
  },
  {
    name: "House Rent Allowance",
    calculationType: "Percentage of Basic" as const,
    value: 50,
  },
];

export const CALC_TYPE_DEFAULTS = {
  Fixed: 0,
  "Percentage of Basic": 10,
  "Percentage of Gross": 40,
  Formula: 0,
} as const;

export const MAX_PERCENTAGE = 100;

export const ERROR_AMOUNT_NEGATIVE = "Amount cannot be negative";
export const ERROR_PERCENTAGE_NEGATIVE = "Percentage cannot be negative";
export const ERROR_PERCENTAGE_EXCEEDS = "Percentage cannot exceed 100%";
export const ERROR_CTC_NEGATIVE = "CTC cannot be negative";
export const ERROR_SPECIAL_ALLOWANCE_NEGATIVE = "Special Allowance cannot be negative";
