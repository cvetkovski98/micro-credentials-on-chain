import { BackendActor } from "../../../lib/backend";
import { Organisation, Result } from "../../models";
import { OrganisationsAPI } from "../api";

export const organisationsAPI = (actor: BackendActor): OrganisationsAPI => ({
  async getAll(): Promise<Result<Array<Organisation>>> {
    return (await actor.organisations_get_all()) as Result<Array<Organisation>>;
  },
});
