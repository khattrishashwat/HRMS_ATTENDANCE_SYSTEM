/** Paise → rupees for display / form inputs. */
export function paiseToRupees(paise: number | null | undefined): number {
  if (paise == null) return 0;
  return paise / 100;
}

/** Rupees → paise for API payloads. */
export function rupeesToPaise(rupees: number | null | undefined): number {
  if (rupees == null) return 0;
  return Math.round(rupees * 100);
}

/** API calculationValue → UI (rupees when calculation type is FIXED). */
export function mapApiCalculationValueToUi(
  calculationType: string | null | undefined,
  apiValue: number | null | undefined
): number {
  if (apiValue == null) return 0;
  if (calculationType === "FIXED") {
    return apiValue / 100;
  }
  return apiValue;
}

/** UI calculationValue → API (paisa for FIXED override only). */
export function mapUiCalculationValueToApi(
  overrideCalculationType: string,
  uiValue: number
): number {
  if (overrideCalculationType === "FIXED") {
    return Math.round(uiValue * 100);
  }
  return uiValue;
}
