import { BackendActor } from "../../../lib/backend";
import { Badge, NewBadgeRequest, Result } from "../../models";
import { BadgesAPI } from "../api";

export const badgesAPI = (actor: BackendActor): BadgesAPI => ({
  async getAll(studentID: bigint): Promise<Result<Array<Badge>>> {
    return (await actor.badges_get_all(studentID)) as Result<Array<Badge>>;
  },
  async getOne(studentID: bigint, id: bigint): Promise<Result<Badge>> {
    return (await actor.badges_get_one(studentID, id)) as Result<Badge>;
  },
  async createOne(badge: NewBadgeRequest): Promise<Result<Badge>> {
    return (await actor.badges_create_one(badge)) as Result<Badge>;
  },
  async deleteOne(studentID: bigint, id: bigint): Promise<Result<boolean>> {
    return (await actor.badges_delete_one(studentID, id)) as Result<boolean>;
  },
});
