import authApi from "./authApi.ts";
import {
  assertValidAuthTokens,
  mapToggleRoleResponse,
  mergeEmployeeAuthWithAdmin,
} from "../utils/authHelpers.ts";
import type { AuthData } from "../store/authTypes.ts";
import {
  switchToAdminRole,
  switchToEmployeeRole,
} from "../redux/store.ts";
import type { AppDispatch, RootState } from "../redux/index.ts";

export function getAdminOrgId(auth: AuthData): string | null {
  return auth.orgId ?? auth.orgid ?? null;
}

/**
 * Switch ORG_ADMIN session into employee mode via backend toggle,
 * then merge tokens and dispatch switchToEmployeeRole.
 */
export async function activateEmployeeRole(
  dispatch: AppDispatch,
  adminData: AuthData
): Promise<AuthData> {
  const orgId = getAdminOrgId(adminData);
  if (!orgId) {
    throw new Error("Organization ID is unavailable.");
  }

  const response = await authApi.toggleRole(
    {
      targetRole: "EMPLOYEE",
      orgId,
    },
    { accessToken: adminData.accessToken, orgId }
  );

  const employeeAuth = mapToggleRoleResponse(response.data);
  const merged = mergeEmployeeAuthWithAdmin(employeeAuth, adminData);
  assertValidAuthTokens(merged, "employee role activation");

  dispatch(switchToEmployeeRole({ employeeAuthData: merged }));
  return merged;
}

export async function handleSwitchToEmployee(
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> {
  const state = getState().auth;
  const adminData = state.adminAuthData;
  if (!adminData?.accessToken) {
    throw new Error("Admin session is unavailable. Please sign in again.");
  }
  await activateEmployeeRole(dispatch, adminData);
}

export async function handleSwitchToAdmin(dispatch: AppDispatch): Promise<void> {
  dispatch(switchToAdminRole());
}
