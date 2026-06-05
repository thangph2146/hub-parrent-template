import type { ApiClient } from "../client";
import { buildAdminListQuery, deleteData, getData, normalizePagedResult, postData, putData, type AdminListQueryParams } from "./_shared";

export class EventSpeakersApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: AdminListQueryParams): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/event-speakers", {
      query: buildAdminListQuery(params, { page: 1, limit: 20 }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get<T = unknown>(id: string): Promise<T> {
    return getData<T>(this.http, `/admin/event-speakers/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/event-speakers", body);
  }

  async update<T = unknown>(id: string, body: Record<string, unknown>): Promise<T> {
    return putData<T>(this.http, `/admin/event-speakers/${id}`, body);
  }

  async remove(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/event-speakers/${id}`);
  }

  async bulk<T = unknown>(body: { action?: string; ids?: string[] }): Promise<T> {
    return this.http.post<T>("/admin/event-speakers/bulk", body as never);
  }
}
