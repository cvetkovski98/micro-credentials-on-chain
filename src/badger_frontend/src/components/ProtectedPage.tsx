import React, { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "../badges/models";
import { useClient, useUser } from "../context/Global";
import { FullScreenLoader } from "./FullScreenLoader";

interface ProtectedPageRoles extends PropsWithChildren {
  roles?: bigint[];
}

export const ProtectedPage: React.FC<ProtectedPageRoles> = ({ roles, children }) => {
  const navigate = useNavigate();
  const client = useClient();
  const user = useUser();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    setLoading(true);
    client
      .isAuthenticated()
      .then((auth) => {
        if (!auth) {
          navigate("/");
        } else if (!user) {
          navigate("/users/register");
        } else if (roles && !hasRolePermission(roles, user.roles)) {
          navigate("/forbidden");
        }
      })
      .finally(() => setLoading(false));
  }, [children]);

  const hasRolePermission = (required: bigint[], actual: Role[]) => {
    const roleIDs = actual.map((role) => role.roleID);
    return required.some((rID) => roleIDs.includes(rID));
  };

  if (loading) {
    return <FullScreenLoader>Loading...</FullScreenLoader>;
  }

  return children;
};
