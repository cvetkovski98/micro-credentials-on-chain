import React, { PropsWithChildren, useEffect } from "react";
import { useClient } from "../context/Global";
import { useNavigate } from "react-router-dom";

export const ProtectedPage: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const client = useClient();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    setLoading((_) => true);
    client.isAuthenticated().then((isAuthenticated) => {
      if (!isAuthenticated) {
        navigate("/");
      }
      setLoading((_) => false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};
