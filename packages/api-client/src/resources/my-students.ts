import type { ApiClient } from "../client";
import { getData, postData, deleteData } from "./_shared";

export interface ParentStudent {
  id: string;
  parentId: string;
  studentCode: string;
  studentName: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddStudentInput {
  studentCode: string;
  studentName?: string;
  note?: string;
}

export class MyStudentsApi {
  constructor(private readonly http: ApiClient) {}

  async list(): Promise<ParentStudent[]> {
    return getData<ParentStudent[]>(this.http, "/parent/my-students");
  }

  async add(input: AddStudentInput): Promise<ParentStudent> {
    return postData<ParentStudent>(this.http, "/parent/my-students", input);
  }

  async remove(id: string | number): Promise<void> {
    await deleteData<unknown>(this.http, `/parent/my-students/${id}`);
  }

  async getDetailedScores<T = unknown>(studentCode: string): Promise<T[]> {
    return getData<T[]>(this.http, `/parent/my-students/scores/detailed/${encodeURIComponent(studentCode)}`);
  }

  async getYearAverages<T = unknown>(studentCode: string): Promise<T[]> {
    return getData<T[]>(this.http, `/parent/my-students/averages/year/${encodeURIComponent(studentCode)}`);
  }

  async getTermAverages<T = unknown>(studentCode: string): Promise<T[]> {
    return getData<T[]>(this.http, `/parent/my-students/averages/terms/${encodeURIComponent(studentCode)}`);
  }

  async getOverallAverage<T = unknown>(studentCode: string): Promise<T | null> {
    try {
      return await getData<T>(this.http, `/parent/my-students/averages/overall/${encodeURIComponent(studentCode)}`);
    } catch {
      return null;
    }
  }
}
