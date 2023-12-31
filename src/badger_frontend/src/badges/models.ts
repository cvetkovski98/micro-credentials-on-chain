// We need this type to handle optional values from the Internet Computer
export type OptionalText = [] | [string];
export type OptionalBigInt = [] | [bigint];

export const STUDENT_ROLE_ID = 1n;
export const LECTURER_ROLE_ID = 2n;
export const ADMINISTRATION_ROLE_ID = 3n;
export const COMPANY_ROLE_ID = 4n;

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
  issuer: Organisation;
  owner: User;
  isRevoked: boolean;
  // isFullAccess: boolean;
  claims: Claim[];
  signedBy: string[];
  createdAt: string;
}

export interface NewBadgeRequest {
  title: string;
  description: OptionalText;
  badgeType: number;
  issuerID: bigint;
  ownerID: string;
  claims: Claim[];
}

export interface Organisation {
  organisationID: bigint;
  name: string;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  principalID: string;
  organisation: Organisation;
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

export interface AccessRequest {
  accessRequestID: bigint;
  user: User;
  badge: Badge;
  createdAt: string;
}

export interface Role {
  roleID: bigint;
  name: string;
}
