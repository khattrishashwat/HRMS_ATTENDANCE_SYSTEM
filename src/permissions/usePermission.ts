import { useSelector } from "react-redux";
import type { RootState } from "../redux/index.ts";

/** Canonical permission hook — reads from Redux auth.permissions */
export const usePermission = () => {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions || []
  );

  const hasPermission = (permission: string) =>
    permissions.includes(permission);

  return { hasPermission, permissions };
};

export default usePermission;
