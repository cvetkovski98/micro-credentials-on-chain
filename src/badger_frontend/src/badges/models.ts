// We need this type to handle optional values from the Internet Computer
export type OptionalText = [] | [string];

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

export interface Student {
  studentID: bigint;
  name: string;
  email: string;
  organisationID: number;
  createdAt: string;
}

export interface NewStudentRequest {
  name: string;
  email: string;
  organisationID: bigint;
}

export interface FileLocation {
  location: string;
}

export const TEST_STUDENT_ID = 1n;
