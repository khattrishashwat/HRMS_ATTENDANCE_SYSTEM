/** Compatibility re-export — auth slice lives in src/store/store.ts */
export {
  default,
  loginSuccess,
  prepareOrgAdminLogin,
  completeOrgAdminLoginAsAdmin,
  switchToAdminRole,
  switchToEmployeeRole,
  restoreActiveRoleAuth,
  logout,
  setAccessToken,
  setXContextOrgId,
  setProfileImage,
  setXContextOrgCode,
  setUserDescription,
} from "../store/store.ts";
export type { UserState, AuthData, RoleMode } from "../store/store.ts";
