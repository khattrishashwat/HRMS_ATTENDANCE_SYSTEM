import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { store } from "../redux/index.ts";
import { setAccessToken } from "../redux/store.ts";
import { performSessionLogout } from "./sessionLogout.ts";

const ENV_VARIANT = (process.env.REACT_APP_ENV_VARIANT || "").toUpperCase();

const getVariantEnvValue = (baseKey: string): string => {
  if (!ENV_VARIANT) return "";
  return process.env[`REACT_APP_${baseKey}_${ENV_VARIANT}`] || "";
};

const CLIENT_ID =
  getVariantEnvValue("X_CLIENT_ID") || process.env.REACT_APP_X_CLIENT_ID || "";
const CLIENT_SECRET =
  getVariantEnvValue("X_CLIENT_SECRET") ||
  process.env.REACT_APP_X_CLIENT_SECRET ||
  "";
const DOMAIN_NAME =
  getVariantEnvValue("DOMAIN_NAME") || process.env.REACT_APP_DOMAIN_NAME || "";

axios.defaults.headers.common["X-Client-Id"] = CLIENT_ID;
axios.defaults.headers.common["X-Client-Secret"] = CLIENT_SECRET;

const api = axios.create({
  baseURL: DOMAIN_NAME,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Id": CLIENT_ID,
    "X-Client-Secret": CLIENT_SECRET,
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let refreshPromise: Promise<string> | null = null;

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const getTimeRemaining = (expiresAt: string | null): number => {
  if (!expiresAt) return Infinity;
  return new Date(expiresAt).getTime() - Date.now();
};

const attachOrgHeaders = (
  headers: Record<string, unknown>,
  state: ReturnType<typeof store.getState>["auth"]
): void => {
  if (!state.orgid) return;

  headers["X-ORG-ID"] = state.orgid;

  if (state.userType === "HOST_ADMIN" && state.xContextOrgId) {
    headers["X-Context-Org-Id"] = state.xContextOrgId;
  }
};

const EXPIRY_SOFT_MS = 120000;

/**
 * Single-flight refresh: concurrent callers share one in-flight request.
 */
const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  const state = store.getState().auth;
  if (!state.refreshToken) {
    throw new Error("No refresh token available");
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const orgHeaders: Record<string, string> = {};
    attachOrgHeaders(orgHeaders, state);

    const { default: authApi } = await import("../servicesAPI/authApi.ts");
    const response = await authApi.generateNewAccessToken(
      { refreshToken: state.refreshToken! },
      state.accessToken,
      orgHeaders
    );

    const data = response.data?.data ?? {};
    const newToken = String(data.accessToken ?? "");
    const accessExpiresAt = String(data.accessExpiresAt ?? "");
    if (!newToken) {
      throw new Error("Refresh response missing accessToken");
    }

    store.dispatch(
      setAccessToken({
        accessToken: newToken,
        accessExpiresAt,
        refreshToken: data.refreshToken ? String(data.refreshToken) : undefined,
        refreshExpiresAt: data.refreshExpiresAt
          ? String(data.refreshExpiresAt)
          : undefined,
      })
    );
    onRefreshed(newToken);
    return newToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const state = store.getState().auth;

    if (!config.headers) config.headers = {} as typeof config.headers;
    attachOrgHeaders(config.headers as Record<string, unknown>, state);

    if (!state.accessToken) return config;

    // Also expire when refresh token itself is past expiry
    if (
      state.refreshExpiresAt &&
      getTimeRemaining(state.refreshExpiresAt) <= 0
    ) {
      await performSessionLogout({ callServer: false, hardRedirect: true });
      return Promise.reject(new Error("Refresh token expired"));
    }

    const remainingTime = getTimeRemaining(state.accessExpiresAt);
    config.headers.Authorization = `Bearer ${state.accessToken}`;

    if (remainingTime > EXPIRY_SOFT_MS) return config;

    // Soft or critical window: ensure a fresh token, then continue with it
    try {
      if (isRefreshing) {
        const token = await new Promise<string>((resolve) => {
          addRefreshSubscriber(resolve);
        });
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      const token = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      await performSessionLogout({ callServer: false, hardRedirect: true });
      return Promise.reject(error);
    }
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const state = store.getState().auth;

      if (!state.refreshToken) {
        await performSessionLogout({ callServer: false, hardRedirect: true });
        return Promise.reject(error);
      }

      try {
        const newToken = isRefreshing
          ? await new Promise<string>((resolve) => addRefreshSubscriber(resolve))
          : await refreshAccessToken();

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        attachOrgHeaders(
          originalRequest.headers as Record<string, unknown>,
          store.getState().auth
        );
        return api(originalRequest);
      } catch (refreshError) {
        await performSessionLogout({ callServer: false, hardRedirect: true });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getClientId = (): string => CLIENT_ID;
export const getClientSecret = (): string => CLIENT_SECRET;
export const getDomainName = (): string => DOMAIN_NAME;

export default api;
