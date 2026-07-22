import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../redux/index.ts";

interface PublicRouteProps {
  children: ReactNode;
}

type LocationLike = {
  pathname?: string;
  search?: string;
  hash?: string;
};

function resolvePostAuthRedirect(
  from: LocationLike | string | null | undefined
): string {
  if (!from) return "/dashboard";
  if (typeof from === "string") {
    return from.startsWith("/") ? from : "/dashboard";
  }
  const pathname = from.pathname || "/dashboard";
  if (pathname === "/sign-in" || pathname === "/login" || pathname === "/reset-password") {
    return "/dashboard";
  }
  return `${pathname}${from.search || ""}${from.hash || ""}`;
}

/**
 * Guards public auth pages (Sign In, Reset Password).
 * Fully authenticated users are redirected to their intended destination or dashboard.
 * Users awaiting org-admin role selection remain on the public auth page.
 */
const PublicRoute = ({ children }: PublicRouteProps): JSX.Element => {
  const location = useLocation();
  const { accessToken, refreshToken, isAwaitingRoleSelection } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = Boolean(
    accessToken && refreshToken && !isAwaitingRoleSelection
  );

  if (isAuthenticated) {
    const state = location.state as { from?: LocationLike | string } | null;
    return <Navigate to={resolvePostAuthRedirect(state?.from)} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
