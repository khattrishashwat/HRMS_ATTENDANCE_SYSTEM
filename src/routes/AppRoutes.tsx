import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicRoute from "./PublicRoute.tsx";
import PrivateRoute from "./PrivateRoute.tsx";
import SignIn from "../pages/Auth/Login.tsx";
import ResetPassword from "../pages/Auth/ResetPassword.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
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

  return <Navigate to="/sign-in" replace state={{ from: location }} />;
};

/**
 * Application route tree.
 * Dashboard renders only inside MainLayout <Outlet /> — never as a standalone shell.
 */
const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
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

      <Route
        element={
          <PublicRoute>
            <MainLayout />
          </PublicRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<div />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<UnknownRouteRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
