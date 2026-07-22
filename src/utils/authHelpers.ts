import { AuthData } from "../redux/authTypes.ts";

function resolveAuthPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid authentication response");
  }

  const record = data as Record<string, unknown>;
  const authentication = record.authentication;

  if (authentication && typeof authentication === "object") {
    return authentication as Record<string, unknown>;
  }

  return record;
}

export function mapAuthResponseToAuthData(
  data: unknown,
  employeeInfo?: {
    media?: { profileImageUrl?: string };
    organization?: { orgLogoUrl?: string };
  }
): AuthData {
  const auth = resolveAuthPayload(data);
  const user = auth.user as Record<string, unknown>;
  const role = user.role as Record<string, unknown> | undefined;
  const orgIdValue =
    user.orgId ?? user.orgid ?? auth.orgId ?? auth.orgid ?? null;
  const orgId = orgIdValue != null ? String(orgIdValue) : null;

  return {
    email: String(user.email ?? ""),
    permissions: (role?.permissions as string[]) ?? (user.permissions as string[]) ?? [],
    userId: String(user.id ?? ""),
    userType: String(user.userType ?? ""),
    description: String(role?.description ?? ""),
    userName: (user.userName as string) ?? null,
    accessToken: String(auth.accessToken ?? ""),
    refreshToken: String(auth.refreshToken ?? ""),
    accessExpiresAt: String(auth.accessExpiresAt ?? ""),
    refreshExpiresAt: String(auth.refreshExpiresAt ?? ""),
    subscribedServices: (user.subscribedServices as AuthData["subscribedServices"]) ?? [],
    merchantId: (user.merchantId as string) ?? null,
    orgId,
    orgid: orgId,
    profileImage: employeeInfo?.media?.profileImageUrl ?? null,
    orgImage: employeeInfo?.organization?.orgLogoUrl ?? null,
  };
}

export function mapPasswordLoginResponse(responseData: {
  authentication: unknown;
  employeeInfo?: {
    media?: { profileImageUrl?: string };
    organization?: { orgLogoUrl?: string };
  };
}): AuthData {
  return mapAuthResponseToAuthData(responseData.authentication, responseData.employeeInfo);
}

export function mapOtpLoginResponse(responseData: {
  data?: unknown;
  employeeInfo?: {
    media?: { profileImageUrl?: string };
    organization?: { orgLogoUrl?: string };
  };
}): AuthData {
  const payload = responseData.data ?? responseData;
  return mapAuthResponseToAuthData(payload, responseData.employeeInfo);
}

export function mapToggleRoleResponse(response: { data?: unknown }): AuthData {
  const root = (response?.data ?? response) as Record<string, unknown>;
  const payload = (root.data ?? root) as Record<string, unknown>;

  const employeeInfo = payload.employeeInfo as
    | {
        media?: { profileImageUrl?: string };
        organization?: { orgLogoUrl?: string };
      }
    | undefined;

  if (payload.authentication) {
    return mapPasswordLoginResponse({
      authentication: payload.authentication,
      employeeInfo,
    });
  }

  return mapAuthResponseToAuthData(payload, employeeInfo);
}

export function mergeEmployeeAuthWithAdmin(
  employeeAuth: AuthData,
  adminAuth: AuthData
): AuthData {
  return {
    ...employeeAuth,
    accessToken: employeeAuth.accessToken || adminAuth.accessToken,
    refreshToken: employeeAuth.refreshToken || adminAuth.refreshToken,
    accessExpiresAt: employeeAuth.accessExpiresAt || adminAuth.accessExpiresAt,
    refreshExpiresAt: employeeAuth.refreshExpiresAt || adminAuth.refreshExpiresAt,
    orgId: employeeAuth.orgId ?? adminAuth.orgId,
    orgid: employeeAuth.orgid ?? adminAuth.orgid,
  };
}

export function assertValidAuthTokens(authData: AuthData, context: string): void {
  if (!authData.accessToken || !authData.refreshToken) {
    throw new Error(`Employee session tokens are missing after ${context}.`);
  }
}
