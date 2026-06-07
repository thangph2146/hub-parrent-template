import type { ApiClient } from "../client";
import { deleteData, getData, putData } from "./_shared";

type SettingsListQuery = Record<string, string | number | boolean | undefined | null>;

export class SettingsApi {
  constructor(private readonly http: ApiClient) {}

  async list<T = unknown>(params?: SettingsListQuery): Promise<T[]> {
    return getData<T[]>(this.http, "/admin/settings", {
      query: params,
    });
  }

  async get<T = unknown>(key: string): Promise<T> {
    return getData<T>(this.http, `/admin/settings/${key}`);
  }

  async update<T = unknown>(body: Record<string, unknown>): Promise<T> {
    return putData<T>(this.http, "/admin/settings", body);
  }

  async remove(id: string | number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/settings/${id}`);
  }

  async getPublicBranding<
    T = { siteName: string; siteDescription: string },
  >(options?: Parameters<ApiClient["get"]>[1]): Promise<T> {
    return getData<T>(this.http, "/public/site-branding", options);
  }
}
