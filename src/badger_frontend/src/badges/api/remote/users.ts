import { BackendActor } from "../../../lib/backend";
import { NewUserRequest, Result, Role, User } from "../../models";
import { UsersAPI } from "../api";

export const usersAPI = (actor: BackendActor): UsersAPI => ({
  async getAll(): Promise<Result<Array<User>>> {
    return (await actor.users_get_all()) as Result<Array<User>>;
  },
  async getOne(id: bigint): Promise<Result<User>> {
    return (await actor.users_get_one(id)) as Result<User>;
  },
  async getWhoAmI(): Promise<Result<User>> {
    return (await actor.users_whoami()) as Result<User>;
  },
  async createOne(user: NewUserRequest): Promise<Result<User>> {
    return (await actor.users_create_one(user)) as Result<User>;
  },
  async deleteOne(id: bigint): Promise<Result<void>> {
    return (await actor.users_delete_one(id)) as Result<void>;
  },
  async getAllRoles(): Promise<Result<Array<Role>>> {
    return (await actor.roles_get_all()) as Result<Array<Role>>;
  },
});
