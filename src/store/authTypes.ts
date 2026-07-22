export type RoleMode = "ADMIN" | "EMPLOYEE";

export interface AuthData {
  email: string;
  permissions: string[];
  userId: string;
  userType: string;
  userName: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  description: string;
  subscribedServices: string[];
  // NOTE: API may return objects with serviceCode; sidebar handles both shapes at runtime
  // Keep typed as string[] for backward compatibility; consumers cast as needed.
  merchantId: string | null;
  orgId: string | null;
  orgid: string | null;
  profileImage: string | null;
  orgImage: string | null;
}

export interface OrgAdminMeta {
  isOrgAdmin: boolean;
  activeRoleMode: RoleMode;
  adminAuthData: AuthData | null;
  employeeAuthData: AuthData | null;
  isAwaitingRoleSelection: boolean;
}
