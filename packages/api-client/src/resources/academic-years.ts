import type { ApiClient } from "../client";
import { deleteData, getData, normalizePagedResult, postData, putData, buildAdminListQuery, type AdminListQueryParams } from "./_shared";

export class AcademicYearsApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(
    params?: AdminListQueryParams,
  ): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/academic-years", {
      query: buildAdminListQuery(params, { page: 1, limit: 20, status: "active" }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get<T = unknown>(id: string): Promise<T> {
    return getData<T>(this.http, `/admin/academic-years/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/academic-years", body);
  }

  async update<T = unknown>(
    id: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return putData<T>(this.http, `/admin/academic-years/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/academic-years/${id}`);
  }

  async restore<T = unknown>(id: string): Promise<T> {
    return postData<T>(this.http, `/admin/academic-years/${id}/restore`);
  }

  async purge(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/academic-years/${id}/hard-delete`);
  }

  async bulk(body: { action: string; ids: string[] }): Promise<void> {
    await postData<unknown>(this.http, "/admin/academic-years/bulk", body);
  }
}
