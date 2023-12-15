import React, { PropsWithChildren, useEffect } from "react";
import { useClient } from "../context/AuthContext";

const CANISTER_ID_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;

export const ProtectedPage: React.FC<PropsWithChildren> = ({ children }) => {
  const client = useClient();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    setLoading((_) => true);
    client.isAuthenticated().then((isAuthenticated) => {
      if (!isAuthenticated) {
        const provider =
          process.env.DFX_NETWORK === "ic"
            ? "https://identity.ic0.app"
            : `http://localhost:4943/?canisterId=${CANISTER_ID_IDENTITY}`;

        console.log(provider);

        client.login({
          identityProvider: provider,
          onSuccess: () => {
            setLoading((_) => false);
          },
          onError: (error) => {
            console.error(error);
            setLoading((_) => false);
          },
        });
      }
      setLoading((_) => false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};
