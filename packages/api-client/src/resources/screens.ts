import type { ApiClient } from "../client";
import { deleteData, getData, normalizePagedResult, postData, putData, buildAdminListQuery, type AdminListQueryParams } from "./_shared";

export class ScreensApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: AdminListQueryParams): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/screens", {
      query: buildAdminListQuery(params, { page: 1, limit: 20, status: "active" }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get<T = unknown>(id: string): Promise<T> {
    return getData<T>(this.http, `/admin/screens/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/screens", body);
  }

  async update<T = unknown>(id: string, body: Record<string, unknown>): Promise<T> {
    return putData<T>(this.http, `/admin/screens/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/screens/${id}`);
  }

  async restore<T = unknown>(id: string): Promise<T> {
    return postData<T>(this.http, `/admin/screens/${id}/restore`);
  }

  async purge(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/screens/${id}/hard-delete`);
  }

  async bulk(body: { action: string; ids: string[] }): Promise<void> {
    await postData<unknown>(this.http, "/admin/screens/bulk", body);
  }
}
