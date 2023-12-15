import { ActorSubclass } from "@dfinity/agent";

import type { _SERVICE as BACKEND_SERVICE } from "../../../declarations/badger_backend/badger_backend.did";
import type { _SERVICE as IDENTITY_SERVICE } from "../../../declarations/internet_identity/internet_identity.did";

export {
  createActor as createBackendActor,
  badger_backend,
} from "../../../declarations/badger_backend";
export {
  createActor as createIdentityActor,
  internet_identity,
} from "../../../declarations/internet_identity";

export type BackendActor = ActorSubclass<BACKEND_SERVICE>;
export type IdentityActor = ActorSubclass<IDENTITY_SERVICE>;
