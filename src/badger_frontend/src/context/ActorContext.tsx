import React, { PropsWithChildren, useEffect } from "react";
import {
  BackendActor,
  IdentityActor,
  createBackendActor,
  createIdentityActor,
} from "../lib/backend";
import { HttpAgent } from "@dfinity/agent";
import { useClient } from "./AuthContext";

const CANISTER_ID_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;
const CANISTER_ID_BADGER_BACKEND = process.env.CANISTER_ID_BADGER_BACKEND;

export interface GlobalContextType {
  backend?: BackendActor;
  identity?: IdentityActor;
}

export const GlobalContext: React.Context<GlobalContextType> =
  React.createContext({});

export const GlobalContextProvider: React.FC<
  PropsWithChildren<GlobalContextType>
> = (props) => {
  const [agent, setAgent] = React.useState<HttpAgent>();

  useEffect(() => {
    const client = useClient();
    const identity = client.getIdentity();
    const agent = new HttpAgent({ identity });
    setAgent(agent);
  }, []);

  if (agent === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <GlobalContext.Provider
      value={{
        backend: createBackendActor(CANISTER_ID_BADGER_BACKEND, { agent }),
        identity: createIdentityActor(CANISTER_ID_IDENTITY, { agent }),
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useBackendActor = (): BackendActor => {
  const context = React.useContext(GlobalContext);
  if (context?.backend === undefined) {
    throw new Error(
      "useBackendActor must be used within a BackendActorProvider"
    );
  }
  return context.backend;
};

export const useIdentityActor = (): IdentityActor => {
  const context = React.useContext(GlobalContext);
  if (context?.identity === undefined) {
    throw new Error(
      "useIdentityActor must be used within a BackendActorProvider"
    );
  }
  return context.identity;
};
