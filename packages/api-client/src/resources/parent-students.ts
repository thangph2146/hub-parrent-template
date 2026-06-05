import type { ApiClient } from "../client";
import {
  getData,
  patchData,
  putData,
  deleteData,
  normalizePagedResult,
  toApiFilterQuery,
} from "./_shared";

export interface ParentStudent {
  id: string;
  parentId: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  studentCode: string;
  studentName: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentStudentsListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  createdAt?: string;
  filters?: Record<string, string>;
}

export interface UpdateParentStudentInput {
  status?: ParentStudent["status"];
}

export class ParentStudentsApi {
  constructor(private readonly http: ApiClient) {}

  async list(params?: ParentStudentsListParams): Promise<{ items: ParentStudent[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/parent-students", {
      query: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        status: params?.status,
        search: params?.search,
        createdAt: params?.createdAt,
        ...toApiFilterQuery(params?.filters),
      },
    });
    return normalizePagedResult<ParentStudent>(payload);
  }

  async detail(id: string | number): Promise<ParentStudent> {
    const payload = await getData<ParentStudent>(this.http, `/admin/parent-students/${id}`);
    return payload;
  }

  async approve(id: string | number): Promise<ParentStudent> {
    const payload = await putData<ParentStudent>(this.http, `/admin/parent-students/${id}`, { status: "approved" });
    return payload;
  }

  async reject(id: string | number): Promise<ParentStudent> {
    const payload = await putData<ParentStudent>(this.http, `/admin/parent-students/${id}`, { status: "rejected" });
    return payload;
  }

  async remove(id: string | number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/parent-students/${id}`);
  }

  async review(
    id: string | number,
    input: { action: "approved" | "rejected"; note?: string },
  ): Promise<ParentStudent> {
    return patchData<ParentStudent>(
      this.http,
      `/admin/parent-students/${id}/review`,
      input,
    );
  }
}
