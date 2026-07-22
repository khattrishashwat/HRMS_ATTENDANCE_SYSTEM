import { AuthData } from "../redux/authTypes.ts";

export const EMPLOYEE_PERSIST_KEY = "persist1:root";

interface EmployeePersistPayload {
  employeeAuthData: AuthData;
}

export function saveEmployeeAuthData(data: AuthData): void {
  const payload: EmployeePersistPayload = { employeeAuthData: data };
  localStorage.setItem(EMPLOYEE_PERSIST_KEY, JSON.stringify(payload));
}

export function loadEmployeeAuthData(): AuthData | null {
  try {
    const raw = localStorage.getItem(EMPLOYEE_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmployeePersistPayload;
    return parsed.employeeAuthData ?? null;
  } catch {
    return null;
  }
}

export function clearEmployeeAuthData(): void {
  localStorage.removeItem(EMPLOYEE_PERSIST_KEY);
}
