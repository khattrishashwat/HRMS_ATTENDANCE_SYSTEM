/** Re-export canonical auth hook backed by Redux */
import { useSelector } from "react-redux";
import type { RootState } from "../redux/index.ts";

const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  return {
    user: auth.isAuthenticated
      ? {
          userId: auth.userId,
          email: auth.email,
          userName: auth.userName,
          userType: auth.userType,
        }
      : null,
    isAuthenticated: Boolean(auth.accessToken && auth.refreshToken),
    permissions: auth.permissions,
    activeRoleMode: auth.activeRoleMode,
  };
};

export default useAuth;
