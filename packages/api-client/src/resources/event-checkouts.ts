import type { ApiClient } from "../client";
import { buildAdminListQuery, normalizePagedResult, type AdminListQueryParams } from "./_shared";

export class EventCheckoutsApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: AdminListQueryParams): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/event-checkouts", {
      query: buildAdminListQuery(params, { page: 1, limit: 20 }),
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async bulkClear<T = unknown>(ids: string[]): Promise<T> {
    return this.http.post<T>("/admin/event-checkouts/bulk", { ids } as never);
  }
}
