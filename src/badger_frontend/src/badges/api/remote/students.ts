import { BackendActor } from "../../../lib/backend";
import { NewStudentRequest, Result, Student } from "../../models";
import { StudentsAPI } from "../api";

export const studentsAPI = (actor: BackendActor): StudentsAPI => ({
  async getAll(): Promise<Result<Array<Student>>> {
    return (await actor.students_get_all()) as Result<Array<Student>>;
  },
  async getOne(id: bigint): Promise<Result<Student>> {
    return (await actor.students_get_one(id)) as Result<Student>;
  },
  async createOne(student: NewStudentRequest): Promise<Result<Student>> {
    return (await actor.students_create_one(student)) as Result<Student>;
  },
  async deleteOne(id: bigint): Promise<Result<void>> {
    return (await actor.students_delete_one(id)) as Result<void>;
  },
});
