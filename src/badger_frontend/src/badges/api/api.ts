import { Badge, NewBadgeRequest, NewUserRequest, OptionalBigInt, Organisation, Result, Role, User } from "../models";

export interface BadgesAPI {
  getAll(userID: bigint): Promise<Result<Badge[]>>;
  getOne(userID: bigint, id: bigint): Promise<Result<Badge>>;
  createOne(badge: NewBadgeRequest): Promise<Result<Badge>>;
  deleteOne(userID: bigint, id: bigint): Promise<Result<boolean>>;
}

export interface OrganisationsAPI {
  getAll(): Promise<Result<Organisation[]>>;
}

export interface UsersAPI {
  getAll(organisation_id: OptionalBigInt, role_id: OptionalBigInt): Promise<Result<User[]>>;
  getWhoAmI(): Promise<Result<User>>;
  createOne(user: NewUserRequest): Promise<Result<User>>;
  getAllRoles(): Promise<Result<Role[]>>;
}
