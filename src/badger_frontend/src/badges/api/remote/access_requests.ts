import { BackendActor } from "../../../lib/backend";
import { AccessRequest, Result } from "../../models";
import { AccessRequestsAPI } from "../api";

export const accessRequestsAPI = (actor: BackendActor): AccessRequestsAPI => ({
  async getAll(): Promise<Result<Array<AccessRequest>>> {
    return (await actor.requests_get_all()) as Result<Array<AccessRequest>>;
  },
  async createOne(badgeID): Promise<Result<AccessRequest>> {
    return (await actor.requests_create_one(badgeID)) as Result<AccessRequest>;
  },
  async approveOne(accessRequestID: bigint): Promise<Result<boolean>> {
    return (await actor.requests_approve_one(accessRequestID)) as Result<boolean>;
  },
});
