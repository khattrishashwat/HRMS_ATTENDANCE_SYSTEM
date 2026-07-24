import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicRoute from "./PublicRoute.tsx";
import PrivateRoute from "./PrivateRoute.tsx";
import SignIn from "../pages/Auth/Login.tsx";
import ResetPassword from "../pages/Auth/ResetPassword.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import Dashboard from "../pages/Dashboard/Dashboard.tsx";
import Employees from "../pages/Employees/Employee/Employees.js";
import ResignationRequest from "../pages/Employees/ResignationRequest/ResignationRequest.tsx";
import type { RootState } from "../redux/index.ts";
import Target from "@/pages/Targets/Target.js";
import Announcements from "@/pages/Announcment/Announcements.js";


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
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="resignationrequest" element={<ResignationRequest />} />
        <Route path="target" element={<Target />} />
        <Route path="announcement" element={<Announcements />} />
        <Route path="profile" element={<div />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<UnknownRouteRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
