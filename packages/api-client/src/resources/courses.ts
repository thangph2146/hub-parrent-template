import type { ApiClient } from "../client";
import { deleteData, getData, normalizePagedResult, postData, putData, buildAdminListQuery, type AdminListQueryParams } from "./_shared";

export class CoursesApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(
    params?: AdminListQueryParams,
  ): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/courses", {
      query: buildAdminListQuery(params, { page: 1, limit: 20, status: "active" }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get<T = unknown>(id: string): Promise<T> {
    return getData<T>(this.http, `/admin/courses/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/courses", body);
  }

  async update<T = unknown>(
    id: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return putData<T>(this.http, `/admin/courses/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/courses/${id}`);
  }

  async restore<T = unknown>(id: string): Promise<T> {
    return postData<T>(this.http, `/admin/courses/${id}/restore`);
  }

  async purge(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/courses/${id}/hard-delete`);
  }

  async bulk(body: { action: string; ids: string[] }): Promise<void> {
    await postData<unknown>(this.http, "/admin/courses/bulk", body);
  }
}
