import { BackendActor } from "../../../lib/backend";
import { NewUserRequest, Result, User } from "../../models";
import { UsersAPI } from "../api";

export const usersAPI = (actor: BackendActor): UsersAPI => ({
  async getAll(): Promise<Result<Array<User>>> {
    return (await actor.users_get_all()) as Result<Array<User>>;
  },
  async getOne(id: bigint): Promise<Result<User>> {
    return (await actor.users_get_one(id)) as Result<User>;
  },
  async createOne(user: NewUserRequest): Promise<Result<User>> {
    return (await actor.users_create_one(user)) as Result<User>;
  },
  async deleteOne(id: bigint): Promise<Result<void>> {
    return (await actor.users_delete_one(id)) as Result<void>;
  },
});
