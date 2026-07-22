import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../redux/index.ts";

interface PrivateRouteProps {
  children: ReactNode;
}


const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const location = useLocation();
  const { accessToken, refreshToken, isAwaitingRoleSelection } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = Boolean(accessToken && refreshToken);

  if (!isAuthenticated || isAwaitingRoleSelection) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
