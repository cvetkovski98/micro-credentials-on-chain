import {
  Badge,
  NewBadgeRequest,
  NewOrganisationRequest,
  NewStudentRequest,
  Organisation,
  Result,
  Student,
} from "../models";

export interface BadgesAPI {
  getAll(studentID: bigint): Promise<Result<Badge[]>>;
  getOne(studentID: bigint, id: bigint): Promise<Result<Badge>>;
  createOne(badge: NewBadgeRequest): Promise<Result<Badge>>;
  deleteOne(studentID: bigint, id: bigint): Promise<Result<boolean>>;
}

export interface OrganisationsAPI {
  getAll(): Promise<Result<Organisation[]>>;
  getOne(id: bigint): Promise<Result<Organisation>>;
  createOne(org: NewOrganisationRequest): Promise<Result<Organisation>>;
  deleteOne(id: bigint): Promise<Result<void>>;
}

export interface StudentsAPI {
  getAll(): Promise<Result<Student[]>>;
  getOne(id: bigint): Promise<Result<Student>>;
  createOne(student: NewStudentRequest): Promise<Result<Student>>;
  deleteOne(id: bigint): Promise<Result<void>>;
}
