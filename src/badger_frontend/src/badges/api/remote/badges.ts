import { BackendActor } from "../../../lib/backend";
import { Badge, NewBadgeRequest, OptionalBigInt, Result } from "../../models";
import { BadgesAPI } from "../api";

export const badgesAPI = (actor: BackendActor): BadgesAPI => ({
  async getAll(organisationID: OptionalBigInt): Promise<Result<Array<Badge>>> {
    return (await actor.badges_get_all(organisationID)) as Result<Array<Badge>>;
  },
  async getOne(badgeID: bigint): Promise<Result<Badge>> {
    return (await actor.badges_get_one(badgeID)) as Result<Badge>;
  },
  async createOne(badge: NewBadgeRequest): Promise<Result<Badge>> {
    return (await actor.badges_create_one(badge)) as Result<Badge>;
  },
  async revokeOne(badgeID: bigint): Promise<Result<boolean>> {
    return (await actor.badges_revoke_one(badgeID)) as Result<boolean>;
  },
});
