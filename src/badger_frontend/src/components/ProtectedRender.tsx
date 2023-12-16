import React, { PropsWithChildren } from "react";
import { useUser } from "../context/Global";
import { hasRoleIDs } from "../lib/util";

interface ProtectedComponentProps extends PropsWithChildren {
  roles: bigint[];
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ roles, children }) => {
  const user = useUser();

  if (!user || !hasRoleIDs(user, roles)) {
    return null;
  }

  return children;
};
