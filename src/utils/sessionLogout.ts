import { store } from "../redux/index.ts";
import { logout } from "../redux/store.ts";

export interface SessionLogoutOptions {
  /** Call POST /auth/logout when a session may still be valid on the server */
  callServer?: boolean;
  /** Use full page navigation (clears in-memory state reliably) */
  hardRedirect?: boolean;
  /** Client-side navigate path when hardRedirect is false */
  redirectTo?: string;
}

/**
 * Single logout path used by Header, Profile, interceptors, and session watchers.
 * Always clears Redux + localStorage via the logout reducer.
 */
export async function performSessionLogout(
  options: SessionLogoutOptions = {}
): Promise<void> {
  const {
    callServer = true,
    hardRedirect = false,
    redirectTo = "/sign-in",
  } = options;

  if (callServer) {
    try {
      const { default: authApi } = await import("../servicesAPI/authApi.ts");
      await authApi.logout();
    } catch {
      // Proceed with local cleanup even if server logout fails
    }
  }

  store.dispatch(logout());

  if (hardRedirect) {
    window.location.href = redirectTo;
    return;
  }

  if (window.location.pathname !== redirectTo) {
    window.location.assign(redirectTo);
  }
}
