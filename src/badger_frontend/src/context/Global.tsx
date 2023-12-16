import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import React, { PropsWithChildren, useEffect } from "react";
import { usersAPI } from "../badges/api/remote/users";
import { User, isOK } from "../badges/models";
import { BackendActor, IdentityActor, createBackendActor, createIdentityActor } from "../lib/backend";
import { FullScreenLoader } from "../components/FullScreenLoader";

const CANISTER_ID_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;
const CANISTER_ID_BADGER_BACKEND = process.env.CANISTER_ID_BADGER_BACKEND;

export interface GlobalContextType {
  client?: AuthClient;
  user?: User;
  setUser?: (u: User) => void;
  backend?: BackendActor;
  identity?: IdentityActor;
}

export const GlobalContext: React.Context<GlobalContextType> = React.createContext({});

export const GlobalContextProvider: React.FC<PropsWithChildren<GlobalContextType>> = (props) => {
  const [client, setClient] = React.useState<AuthClient>();
  const [backend, setBackend] = React.useState<BackendActor>();
  const [identity, setIdentity] = React.useState<IdentityActor>();
  const [user, setUser] = React.useState<User>();

  const [initialized, setInitialized] = React.useState(false);
  const [userLoading, setUserLoading] = React.useState(false);

  useEffect(() => {
    setInitialized(() => false);

    console.debug("Started initializing");

    AuthClient.create()
      .then((client) => {
        const identity = client.getIdentity();
        const agent = new HttpAgent({ identity });
        const backend = createBackendActor(CANISTER_ID_BADGER_BACKEND, { agent });
        const indentity = createIdentityActor(CANISTER_ID_IDENTITY, { agent });

        setClient(() => client);
        setBackend(() => backend);
        setIdentity(() => indentity);

        console.debug("Created AuthClient and set backend and identity actors");
        console.debug("Checking if user is authenticated");

        client.isAuthenticated().then((isAuthenticated) => {
          if (isAuthenticated) {
            console.debug("User is authenticated, loading user");

            setUserLoading(() => true);
            const remoteUsersAPI = usersAPI(backend);

            remoteUsersAPI
              .getWhoAmI()
              .then((resp) => {
                if (isOK(resp)) {
                  console.debug("Loaded user successfully");
                  setUser(() => resp.ok);
                } else {
                  console.debug("Tried to load user but it was not found. Error: ", resp.error);
                }
              })
              .finally(() => {
                setUserLoading(() => false);
              });
          }
        });
      })
      .finally(() => {
        console.debug("Finished initializing");
        setInitialized(() => true);
      });
  }, []);

  if (!initialized || userLoading) {
    let text = "Initializing app...";
    if (userLoading) {
      text = "Loading user...";
    }

    return <FullScreenLoader>Loading...</FullScreenLoader>
  }

  return (
    <GlobalContext.Provider
      value={{
        user,
        client,
        backend,
        identity,
        setUser,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useClient = (): AuthClient => {
  const context = React.useContext(GlobalContext);
  if (context?.client === undefined) {
    throw new Error("useClient must be used within a BackendActorProvider");
  }
  return context.client;
};

export const useBackendActor = (): BackendActor => {
  const context = React.useContext(GlobalContext);
  if (context?.backend === undefined) {
    throw new Error("useBackendActor must be used within a BackendActorProvider");
  }
  return context.backend;
};

export const useIdentityActor = (): IdentityActor => {
  const context = React.useContext(GlobalContext);
  if (context?.identity === undefined) {
    throw new Error("useIdentityActor must be used within a BackendActorProvider");
  }
  return context.identity;
};

export const useUser = (): User => {
  const context = React.useContext(GlobalContext);
  return context.user;
};

export const useUserSetter = (): ((u: User) => void) => {
  const context = React.useContext(GlobalContext);
  return context.setUser!!;
};
