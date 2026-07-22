import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/index.ts";
import { restoreActiveRoleAuth } from "../../redux/store.ts";
import { saveEmployeeAuthData } from "../../utils/rolePersistence.ts";
import { performSessionLogout } from "../../utils/sessionLogout.ts";

/**
 * Runs once after persist rehydration to restore org-admin active role
 * and to expire sessions whose access token is already past expiry.
 */
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const hasRestoredRole = useRef(false);
  const {
    accessExpiresAt,
    refreshExpiresAt,
    isOrgAdmin,
    activeRoleMode,
    employeeAuthData,
    isAwaitingRoleSelection,
    accessToken,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (hasRestoredRole.current) return;
    hasRestoredRole.current = true;

    if (isOrgAdmin && !isAwaitingRoleSelection) {
      if (activeRoleMode === "EMPLOYEE" && employeeAuthData) {
        saveEmployeeAuthData(employeeAuthData);
      }
      dispatch(restoreActiveRoleAuth());
    }
  }, [dispatch, isOrgAdmin, activeRoleMode, employeeAuthData, isAwaitingRoleSelection]);

  useEffect(() => {
    if (!accessToken) return;

    const accessExpired =
      accessExpiresAt &&
      !Number.isNaN(new Date(accessExpiresAt).getTime()) &&
      new Date(accessExpiresAt).getTime() <= Date.now();

    const refreshExpired =
      refreshExpiresAt &&
      !Number.isNaN(new Date(refreshExpiresAt).getTime()) &&
      new Date(refreshExpiresAt).getTime() <= Date.now();

    if (accessExpired || refreshExpired) {
      void performSessionLogout({ callServer: false, hardRedirect: true });
    }
  }, [accessExpiresAt, refreshExpiresAt, accessToken]);

  return null;
};

export default AuthInitializer;
