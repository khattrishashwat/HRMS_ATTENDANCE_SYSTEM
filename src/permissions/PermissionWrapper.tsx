import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/index.ts";

interface Props {
  permission: string;
  children: React.ReactNode;
}

const PermissionWrapper = ({ permission, children }: Props) => {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions || []
  );

  if (!permissions.includes(permission)) return null;
  return <>{children}</>;
};

export default PermissionWrapper;
