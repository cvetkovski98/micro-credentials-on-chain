import React, { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClient, useUser } from "../context/Global";
import { FullScreenLoader } from "./FullScreenLoader";

export const ProtectedPage: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const client = useClient();
  const user = useUser();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    setLoading((_) => true);
    client.isAuthenticated().then((isAuthenticated) => {
      if (!isAuthenticated) {
        navigate("/");
      } else if (!user) {
        navigate("/users/register");
      }
      setLoading((_) => false);
    });
  }, []);

  if (loading) {
    return <FullScreenLoader>Loading...</FullScreenLoader>;
  }

  return children;
};
