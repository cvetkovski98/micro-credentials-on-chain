import { BackendActor } from "../../../lib/backend";
import { NewOrganisationRequest, Organisation, Result } from "../../models";
import { OrganisationsAPI } from "../api";

export const organisationsAPI = (actor: BackendActor): OrganisationsAPI => ({
  async getAll(): Promise<Result<Array<Organisation>>> {
    return (await actor.organisations_get_all()) as Result<Array<Organisation>>;
  },
  async getOne(id: bigint): Promise<Result<Organisation>> {
    return (await actor.organisations_get_one(id)) as Result<Organisation>;
  },
  async createOne(org: NewOrganisationRequest): Promise<Result<Organisation>> {
    return (await actor.organisations_create_one(org)) as Result<Organisation>;
  },
  async deleteOne(id: bigint): Promise<Result<void>> {
    return (await actor.organisations_delete_one(id)) as Result<void>;
  },
});
