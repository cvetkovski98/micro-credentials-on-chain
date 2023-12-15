import React, { PropsWithChildren, useEffect } from "react";
import {
  BackendActor,
  IdentityActor,
  createBackendActor,
  createIdentityActor,
} from "../lib/backend";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

const CANISTER_ID_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;
const CANISTER_ID_BADGER_BACKEND = process.env.CANISTER_ID_BADGER_BACKEND;

export interface GlobalContextType {
  client?: AuthClient;
  backend?: BackendActor;
  identity?: IdentityActor;
}

export const GlobalContext: React.Context<GlobalContextType> =
  React.createContext({});

export const GlobalContextProvider: React.FC<
  PropsWithChildren<GlobalContextType>
> = (props) => {
  const [client, setClient] = React.useState<AuthClient>();
  const [agent, setAgent] = React.useState<HttpAgent>();

  useEffect(() => {
    AuthClient.create().then((client) => {
      setClient(client);
    });
  }, []);

  useEffect(() => {
    if (!client) return;

    const identity = client.getIdentity();
    const agent = new HttpAgent({ identity });
    setAgent(() => agent);
  }, [client, client?.getIdentity()]);

  if (!client || !agent) {
    return <div>Loading...</div>;
  }

  return (
    <GlobalContext.Provider
      value={{
        client,
        backend: createBackendActor(CANISTER_ID_BADGER_BACKEND, { agent }),
        identity: createIdentityActor(CANISTER_ID_IDENTITY, { agent }),
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useClient = (): AuthClient => {
  const context = React.useContext(GlobalContext);
  if (context?.client === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context.client;
};

export const useBackendActor = (): BackendActor => {
  const context = React.useContext(GlobalContext);
  if (context?.backend === undefined) {
    throw new Error(
      "useBackendActor must be used within a BackendActorProvider",
    );
  }
  return context.backend;
};

export const useIdentityActor = (): IdentityActor => {
  const context = React.useContext(GlobalContext);
  if (context?.identity === undefined) {
    throw new Error(
      "useIdentityActor must be used within a BackendActorProvider",
    );
  }
  return context.identity;
};
