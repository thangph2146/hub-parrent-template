import type { ApiClient } from "../client";
import { buildAdminListQuery, deleteData, getData, normalizePagedResult, postData, putData, type AdminListQueryParams } from "./_shared";

export class EventRegistrationsApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: AdminListQueryParams): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/event-registrations", {
      query: buildAdminListQuery(params, { page: 1, limit: 20 }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get<T = unknown>(id: string): Promise<T> {
    return getData<T>(this.http, `/admin/event-registrations/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/event-registrations", body);
  }

  async update<T = unknown>(id: string, body: Record<string, unknown>): Promise<T> {
    return putData<T>(this.http, `/admin/event-registrations/${id}`, body);
  }

  async setAttendance<T = unknown>(
    id: string,
    body: {
      action:
        | "checkin"
        | "checkout"
        | "reset-checkin"
        | "reset-checkout"
        | "reset-all";
    },
  ): Promise<T> {
    return postData<T>(this.http, `/admin/event-registrations/${id}/attendance`, body);
  }

  async remove(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/event-registrations/${id}`);
  }

  async restore<T = unknown>(id: string): Promise<T> {
    return postData<T>(this.http, `/admin/event-registrations/${id}/restore`);
  }

  async purge(id: string): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/event-registrations/${id}/hard-delete`);
  }

  async bulk(body: { action: string; ids: string[] }): Promise<void> {
    await postData<unknown>(this.http, "/admin/event-registrations/bulk", body);
  }
}
