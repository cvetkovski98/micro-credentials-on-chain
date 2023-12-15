import { Badge, NewBadgeRequest, NewOrganisationRequest, NewUserRequest, Organisation, Result, User } from "../models";

export interface BadgesAPI {
  getAll(userID: bigint): Promise<Result<Badge[]>>;
  getOne(userID: bigint, id: bigint): Promise<Result<Badge>>;
  createOne(badge: NewBadgeRequest): Promise<Result<Badge>>;
  deleteOne(userID: bigint, id: bigint): Promise<Result<boolean>>;
}

export interface OrganisationsAPI {
  getAll(): Promise<Result<Organisation[]>>;
  getOne(id: bigint): Promise<Result<Organisation>>;
  createOne(org: NewOrganisationRequest): Promise<Result<Organisation>>;
  deleteOne(id: bigint): Promise<Result<void>>;
}

export interface UsersAPI {
  getAll(): Promise<Result<User[]>>;
  getOne(id: bigint): Promise<Result<User>>;
  getWhoAmI(): Promise<Result<User>>;
  createOne(user: NewUserRequest): Promise<Result<User>>;
  deleteOne(id: bigint): Promise<Result<void>>;
}
