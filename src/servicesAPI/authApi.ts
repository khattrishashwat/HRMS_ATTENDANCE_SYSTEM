import axios, { type AxiosResponse } from "axios";
import api, {
  getClientId,
  getClientSecret,
  getDomainName,
} from "./axios.ts";

/** Client credentials used by unauthenticated auth endpoints (matches prior page behavior). */
const clientHeaders = () => ({
  "X-Client-Id": getClientId(),
  "X-Client-Secret": getClientSecret(),
});

export interface LoginWithPasswordPayload {
  loginId: string;
  password: string;
  rememberMe: boolean;
  captcha: string;
}

export interface LoginWithOtpPayload {
  loginId: string;
  otp: string;
  rememberMe: boolean;
  captcha: string;
}

export interface UnauthorizedOtpPayload {
  loginId: string;
  useCase: "LOGIN" | "FORGOT_PASSWORD" | "RESET_PASSWORD";
  captcha: string;
}

export interface ForgotPasswordPayload {
  loginId: string;
  otp: string;
  newPassword: string;
  captcha: string;
}

export interface ResetExpiredPasswordPayload {
  loginId: string;
  oldPassword: string;
  newPassword: string;
  otp: string;
}

export interface AuthorizedOtpPayload {
  useCase: "RESET_PASSWORD";
  currentPassword: string;
}

export interface ResetPasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  loginId: string;
  otp: string;
}

export interface GenerateNewAccessTokenPayload {
  refreshToken: string;
}

const authApi = {
  loginWithPassword(
    payload: LoginWithPasswordPayload
  ): Promise<AxiosResponse> {
    return api.post("/auth/loginWithPassword", payload, {
      headers: clientHeaders(),
    });
  },

  loginWithOtp(payload: LoginWithOtpPayload): Promise<AxiosResponse> {
    return api.post("/auth/loginWithOtp", payload, {
      headers: clientHeaders(),
    });
  },

  sendUnauthorizedOtp(
    payload: UnauthorizedOtpPayload
  ): Promise<AxiosResponse> {
    return api.post("/auth/otp/unauthorized", payload, {
      headers: clientHeaders(),
    });
  },

  forgotPassword(payload: ForgotPasswordPayload): Promise<AxiosResponse> {
    return api.post("/auth/forgotPassword", payload, {
      headers: clientHeaders(),
    });
  },

  resetExpiredPassword(
    payload: ResetExpiredPasswordPayload
  ): Promise<AxiosResponse> {
    return api.post("/auth/resetExpiredPassword", payload, {
      headers: clientHeaders(),
    });
  },

  sendAuthorizedOtp(payload: AuthorizedOtpPayload): Promise<AxiosResponse> {
    return api.post("/auth/otp/authorized", payload);
  },

  resetPassword(payload: ResetPasswordPayload): Promise<AxiosResponse> {
    return api.post("/auth/resetPassword", payload);
  },

  logout(): Promise<AxiosResponse> {
    return api.post("/auth/logout");
  },

  toggleRole(
    payload: {
      targetRole: "EMPLOYEE" | "ADMIN";
      orgId?: string | null;
    },
    options?: { accessToken?: string; orgId?: string | null }
  ): Promise<AxiosResponse> {
    const headers: Record<string, string> = {};
    if (options?.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }
    if (options?.orgId) {
      headers["X-ORG-ID"] = options.orgId;
    }
    return api.post("/toggleRole", payload, { headers });
  },


  generateNewAccessToken(
    payload: GenerateNewAccessTokenPayload,
    accessToken?: string | null,
    orgHeaders?: Record<string, string>
  ): Promise<AxiosResponse> {
    const headers: Record<string, string> = {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Content-Type": "application/json",
      ...clientHeaders(),
      ...orgHeaders,
    };

    return axios.post("/auth/generateNewAccessToken", payload, {
      baseURL: getDomainName(),
      headers,
    });
  },
};

export default authApi;
