import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthData, RoleMode } from "./authTypes.ts";
import { clearEmployeeAuthData } from "../utils/rolePersistence.ts";

interface UserState {
  email: string;
  permissions: string[];
  userType: string;
  userId: string;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  merchantId: string | null;
  subscribedServices: string[];
  accessExpiresAt: string | null;
  refreshExpiresAt: string | null;
  userName: string | null;
  orgid: string | null;
  description: string| null;
  xContextOrgId: number | null;
  profileImage: string | null;
  orgImage: string | null;
  xContextOrgCode: string | null;
  isOrgAdmin: boolean;
  activeRoleMode: RoleMode;
  adminAuthData: AuthData | null;
  employeeAuthData: AuthData | null;
  isAwaitingRoleSelection: boolean;
}

const initialState: UserState = {
  email: "",
  permissions: [],
  userType: "",
  userId: "",
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  subscribedServices: [],
  accessExpiresAt: null,
  refreshExpiresAt: null,
  profileImage: null,
  merchantId: null,
  userName: null,
  description:null,
  orgid: null,
  xContextOrgId: null,
  xContextOrgCode: null,
  orgImage: null,
  isOrgAdmin: false,
  activeRoleMode: "ADMIN",
  adminAuthData: null,
  employeeAuthData: null,
  isAwaitingRoleSelection: false,
};

function applyAuthDataToState(state: UserState, authData: AuthData) {
  state.email = authData.email;
  state.permissions = authData.permissions;
  state.userId = authData.userId;
  state.userType = authData.userType;
  state.userName = authData.userName;
  state.accessToken = authData.accessToken;
  state.refreshToken = authData.refreshToken;
  state.accessExpiresAt = authData.accessExpiresAt;
  state.refreshExpiresAt = authData.refreshExpiresAt;
  state.subscribedServices = authData.subscribedServices;
  state.merchantId = authData.merchantId;
  state.orgid = authData.orgId ?? authData.orgid;
  state.profileImage = authData.profileImage;
  state.orgImage = authData.orgImage;
  state.description = authData.description;
}

function syncNestedTokens(
  state: UserState,
  tokens: {
    accessToken: string;
    accessExpiresAt: string;
    refreshToken?: string;
    refreshExpiresAt?: string;
  }
) {
  state.accessToken = tokens.accessToken;
  state.accessExpiresAt = tokens.accessExpiresAt;
  if (tokens.refreshToken) state.refreshToken = tokens.refreshToken;
  if (tokens.refreshExpiresAt) state.refreshExpiresAt = tokens.refreshExpiresAt;

  const patch = (auth: AuthData | null) => {
    if (!auth) return;
    auth.accessToken = tokens.accessToken;
    auth.accessExpiresAt = tokens.accessExpiresAt;
    if (tokens.refreshToken) auth.refreshToken = tokens.refreshToken;
    if (tokens.refreshExpiresAt) auth.refreshExpiresAt = tokens.refreshExpiresAt;
  };

  if (state.isOrgAdmin) {
    if (state.activeRoleMode === "ADMIN") {
      patch(state.adminAuthData);
    } else if (state.activeRoleMode === "EMPLOYEE") {
      patch(state.employeeAuthData);
    }
  }
}

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthData | Partial<UserState>>) {
      const payload = action.payload as AuthData & Partial<UserState>;
      if (payload.accessToken && payload.refreshToken) {
        applyAuthDataToState(state, payload as AuthData);
      } else {
        Object.assign(state, action.payload);
      }
      state.isAuthenticated = true;
      state.isAwaitingRoleSelection = false;
      state.isOrgAdmin = false;
      state.activeRoleMode = "ADMIN";
      state.adminAuthData = null;
      state.employeeAuthData = null;
    },
    prepareOrgAdminLogin(state, action: PayloadAction<{ adminAuthData: AuthData }>) {
      state.isOrgAdmin = true;
      state.activeRoleMode = "ADMIN";
      state.adminAuthData = action.payload.adminAuthData;
      state.isAwaitingRoleSelection = true;
    },
    completeOrgAdminLoginAsAdmin(state) {
      if (!state.adminAuthData) return;
      applyAuthDataToState(state, state.adminAuthData);
      state.activeRoleMode = "ADMIN";
      state.isAuthenticated = true;
      state.isAwaitingRoleSelection = false;
    },
    switchToAdminRole(state) {
      if (!state.adminAuthData) return;
      state.activeRoleMode = "ADMIN";
      applyAuthDataToState(state, state.adminAuthData);
      state.isAuthenticated = true;
      state.isAwaitingRoleSelection = false;
    },
    switchToEmployeeRole(state, action: PayloadAction<{ employeeAuthData: AuthData }>) {
      state.employeeAuthData = action.payload.employeeAuthData;
      state.activeRoleMode = "EMPLOYEE";
      applyAuthDataToState(state, action.payload.employeeAuthData);
      state.isAuthenticated = true;
      state.isAwaitingRoleSelection = false;
    },
    restoreActiveRoleAuth(state) {
      if (!state.isOrgAdmin) return;

      if (state.activeRoleMode === "EMPLOYEE" && state.employeeAuthData) {
        applyAuthDataToState(state, state.employeeAuthData);
        state.isAuthenticated = true;
        return;
      }

      if (state.adminAuthData) {
        applyAuthDataToState(state, state.adminAuthData);
        state.isAuthenticated = true;
      }
    },
    logout(state) {
      Object.assign(state, initialState);
      clearEmployeeAuthData();
      localStorage.clear();
    },
    setAccessToken(
      state,
      action: PayloadAction<{
        accessToken: string;
        accessExpiresAt: string;
        refreshToken?: string;
        refreshExpiresAt?: string;
      }>
    ) {
      syncNestedTokens(state, action.payload);
    },
    setXContextOrgId(state, action: PayloadAction<number | null>) {
      state.xContextOrgId = action.payload;
    },
    setProfileImage(state, action: PayloadAction<string>) {
      state.profileImage = action.payload;
    },
    setUserDescription(state, action: PayloadAction<string>) {
      state.description = action.payload;
    },
    setXContextOrgCode(state, action: PayloadAction<string | null>) {
      state.xContextOrgCode = action.payload;
    },
  },
});

export const {
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
} = userSlice.actions;

export type { UserState, AuthData, RoleMode };
export default userSlice.reducer;
