import {
  AccessRequest,
  Badge,
  NewBadgeRequest,
  NewUserRequest,
  OptionalBigInt,
  OptionalText,
  Organisation,
  Result,
  Role,
  User,
} from "../models";

export interface BadgesAPI {
  getAll(principalID: OptionalText, organisationID: OptionalBigInt): Promise<Result<Badge[]>>;
  getOne(badgeID: bigint): Promise<Result<Badge>>;
  createOne(badge: NewBadgeRequest): Promise<Result<Badge>>;
  revokeOne(badgeID: bigint): Promise<Result<boolean>>;
}

export interface OrganisationsAPI {
  getAll(): Promise<Result<Organisation[]>>;
}

export interface UsersAPI {
  getAll(organisation_id: OptionalBigInt, role_id: OptionalBigInt): Promise<Result<User[]>>;
  getOne(principalID: string): Promise<Result<User>>;
  getWhoAmI(): Promise<Result<User>>;
  createOne(user: NewUserRequest): Promise<Result<User>>;
  getAllRoles(): Promise<Result<Role[]>>;
}

export interface AccessRequestsAPI {
  getAll(): Promise<Result<AccessRequest[]>>;
  createOne(badgeID: bigint): Promise<Result<AccessRequest>>;
  approveOne(accessRequestID: bigint): Promise<Result<boolean>>;
}
