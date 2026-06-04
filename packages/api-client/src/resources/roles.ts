import type { ApiClient } from "../client";
import { deleteData, getData, normalizePagedResult, postData, putData } from "./_shared";

type RequestQuery = Record<string, string | number | boolean | undefined | null>;

export class RolesApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: RequestQuery): Promise<{ items: T[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/roles", {
      query: { page: 1, limit: 20, ...params },
    });
    const normalized = normalizePagedResult<T>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async listAll<T = unknown>(): Promise<T[]> {
    const payload = await this.http.get<unknown>("/admin/roles", {
      query: { page: 1, limit: 500, status: "all" },
    });
    return normalizePagedResult<T>(payload).items;
  }

  async listPermissions<T extends { id: number; code: string; name: string; description: string | null }>(): Promise<T[]> {
    try {
      return await getData<T[]>(this.http, "/admin/roles/permissions");
    } catch {
      return [];
    }
  }

  async get<T = unknown>(id: string | number): Promise<T> {
    return getData<T>(this.http, `/admin/roles/${id}`);
  }

  async create<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return postData<T>(this.http, "/admin/roles", body);
  }

  async update<T = unknown>(id: string | number, body: Record<string, unknown>): Promise<T> {
    return putData<T>(this.http, `/admin/roles/${id}`, body);
  }

  async remove(id: string | number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/roles/${id}`);
  }

  async restore<T = unknown>(id: string | number): Promise<T> {
    return postData<T>(this.http, `/admin/roles/${id}/restore`);
  }

  async purge(id: string | number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/roles/${id}/hard-delete`);
  }

  async bulk(body: { action: string; ids: string[] }): Promise<void> {
    await postData<unknown>(this.http, "/admin/roles/bulk", body);
  }

  async options<T = unknown>(params?: { column?: string; search?: string; limit?: number }): Promise<T[]> {
    return getData<T[]>(this.http, "/admin/roles/options", { query: params });
  }
}
