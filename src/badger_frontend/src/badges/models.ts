// We need this type to handle optional values from the Internet Computer
export type OptionalText = [] | [string];
export type OptionalBigInt = [] | [bigint];

export const STUDENT_ROLE_ID = 1n;
export const LECTURER_ROLE_ID = 2n;
export const ADMINISTRATION_ROLE_ID = 3n;

export type Result<T> = { ok: T } | { error: string };

export function isOK<T>(result: Result<T>): result is { ok: T } {
  return "ok" in result;
}

export interface Claim {
  key: string;
  value: string;
}

export interface Badge {
  badgeID: bigint;
  title: string;
  description: OptionalText;
  badgeType: number;
  issuerID: bigint;
  ownerID: bigint;
  claims: Claim[];
  signedBy: number[];
  createdAt: string;
}

export interface NewBadgeRequest {
  title: string;
  description: OptionalText;
  badgeType: number;
  issuerID: bigint;
  ownerID: bigint;
  claims: Claim[];
  signedBy: bigint[];
}

export interface Organisation {
  organisationID: bigint;
  name: string;
  createdAt: string;
}

export interface NewOrganisationRequest {
  name: string;
}

export interface User {
  userID: bigint;
  name: string;
  email: string;
  organisationID: number;
  roles: Role[];
  createdAt: string;
}

export interface NewUserRequest {
  name: string;
  email: string;
  organisationID: bigint;
  roles: bigint[];
}

export interface FileLocation {
  location: string;
}

export interface Role {
  roleID: bigint;
  name: string;
}
