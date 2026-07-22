import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicRoute from "./PublicRoute.tsx";
import PrivateRoute from "./PrivateRoute.tsx";
import SignIn from "../pages/Auth/Login.tsx";
import ResetPassword from "../pages/Auth/ResetPassword.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import type { RootState } from "../redux/index.ts";

/**
 * Catch-all for unknown URLs.
 * Authenticated users → dashboard; others → sign-in (preserving destination).
 */
const UnknownRouteRedirect = (): JSX.Element => {
  const location = useLocation();
  const { accessToken, refreshToken, isAwaitingRoleSelection } = useSelector(
    (state: RootState) => state.auth
  );
  const isAuthenticated = Boolean(
    accessToken && refreshToken && !isAwaitingRoleSelection
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Navigate to="/sign-in" replace state={{ from: location }} />
  );
};

/**
 * Application route tree.
 * Auth lifecycle components (AuthInitializer / TokenWatcher) mount in App.tsx.
 *
 * Existing auth pages:
 * - /sign-in (Login)
 * - /login (legacy alias → /sign-in)
 * - /reset-password
 *
 * Forgot-password UI lives inside Login — no standalone page/route.
 */
const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route
        path="/sign-in"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected application shell */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<div />} />
        <Route path="profile" element={<div />} />
      </Route>

      {/* Entry + unknown paths */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<UnknownRouteRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
