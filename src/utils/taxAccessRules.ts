/**
 * Employee Tax Declaration — access & status rules.
 * Source of truth for navigation gates and action permissions.
 */

export type TaxRegimeValue = "OLD" | "NEW" | string | null | undefined;

export type DeclarationStatusValue =
  | "DRAFT"
  | "SUBMITTED"
  | "DECLARED"
  | "REJECTED"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | string
  | null
  | undefined;

/** Backend HRA section code ↔ UI label mapping */
export const HRA_BACKEND_SECTION_CODE = "10(13A)";
export const HRA_UI_LABEL = "HRA";

export function hasTaxRegimeSelected(taxRegime: TaxRegimeValue): boolean {
  if (taxRegime == null) return false;
  const normalized = String(taxRegime).trim().toUpperCase();
  return normalized === "OLD" || normalized === "NEW";
}

export function normalizeDeclarationStatus(
  status: DeclarationStatusValue
): string {
  if (status == null) return "";
  return String(status).trim().toUpperCase();
}

export function isHraSectionCode(sectionCode: string | null | undefined): boolean {
  if (!sectionCode) return false;
  const code = String(sectionCode).trim().toUpperCase();
  return code === "HRA" || code === "10(13A)";
}

/** Normalize UI/legacy codes to backend section codes for API payloads. */
export function toBackendSectionCode(sectionCode: string): string {
  if (isHraSectionCode(sectionCode)) return HRA_BACKEND_SECTION_CODE;
  return sectionCode;
}

/**
 * Edit amounts / add-remove entries only in DRAFT
 * (also allow empty/null so first-time users can fill before first save).
 */
export function canEditDeclaration(status: DeclarationStatusValue): boolean {
  const s = normalizeDeclarationStatus(status);
  return s === "DRAFT" || s === "";
}

/** Save Draft only when DRAFT (or not yet set). */
export function canSaveDraft(status: DeclarationStatusValue): boolean {
  return canEditDeclaration(status);
}

/**
 * Upload Proof enabled for DRAFT, SUBMITTED, and DECLARED.
 * Also allow empty/null status so first-time drafts can attach proofs.
 */
export function canUploadProof(status: DeclarationStatusValue): boolean {
  const s = normalizeDeclarationStatus(status);
  return s === "DRAFT" || s === "SUBMITTED" || s === "DECLARED" || s === "";
}

/**
 * Tax Projection is visible for any status once taxRegime is selected.
 * Do NOT gate on declarationStatus.
 */
export function canAccessTaxProjection(
  taxRegime: TaxRegimeValue,
  _status?: DeclarationStatusValue
): boolean {
  return hasTaxRegimeSelected(taxRegime);
}

/**
 * Submit declaration from Tax Projection for DRAFT, SUBMITTED, and DECLARED.
 * Do NOT restrict submit visibility/messaging to DRAFT only.
 */
export function canSubmitDeclaration(status: DeclarationStatusValue): boolean {
  const s = normalizeDeclarationStatus(status);
  return s === "DRAFT" || s === "SUBMITTED" || s === "DECLARED" || s === "";
}

export function canAccessDeclarations(taxRegime: TaxRegimeValue): boolean {
  return hasTaxRegimeSelected(taxRegime);
}


