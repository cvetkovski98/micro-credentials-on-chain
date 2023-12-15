import { AuthClient } from "@dfinity/auth-client";
import React, { PropsWithChildren, useEffect } from "react";
import { BackendActor, IdentityActor } from "../lib/backend";

export interface AuthContextType {
  client?: AuthClient;
  backend?: BackendActor;
  identity?: IdentityActor;
}

export const AuthContext: React.Context<AuthContextType> = React.createContext(
  {}
);

export const AuthProvider: React.FC<PropsWithChildren<AuthContextType>> = (
  props
) => {
  const [client, setClient] = React.useState<AuthClient>();

  useEffect(() => {
    AuthClient.create().then((client) => {
      setClient(client);
    });
  }, []);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ client }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useClient = (): AuthClient => {
  const context = React.useContext(AuthContext);
  if (context?.client === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context.client;
};
