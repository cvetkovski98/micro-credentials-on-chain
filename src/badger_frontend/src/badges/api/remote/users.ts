import { BackendActor } from "../../../lib/backend";
import { NewUserRequest, OptionalBigInt, Result, Role, User } from "../../models";
import { UsersAPI } from "../api";

export const usersAPI = (actor: BackendActor): UsersAPI => ({
  async getAll(organisation_id: OptionalBigInt, role_id: OptionalBigInt): Promise<Result<Array<User>>> {
    return (await actor.users_get_all(organisation_id, role_id)) as Result<Array<User>>;
  },
  async getOne(principalID: string): Promise<Result<User>> {
    return (await actor.users_get_one(principalID)) as Result<User>;
  },
  async getWhoAmI(): Promise<Result<User>> {
    return (await actor.users_whoami()) as Result<User>;
  },
  async createOne(user: NewUserRequest): Promise<Result<User>> {
    return (await actor.users_create_one(user)) as Result<User>;
  },
  async getAllRoles(): Promise<Result<Array<Role>>> {
    return (await actor.roles_get_all()) as Result<Array<Role>>;
  },
});
