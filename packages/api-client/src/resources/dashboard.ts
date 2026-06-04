import type { ApiClient } from "../client";
import { getData } from "./_shared";

export class DashboardApi {
  constructor(private readonly http: ApiClient) {}

  async stats<T = unknown>(): Promise<T> {
    return getData<T>(this.http, "/admin/dashboard/stats");
  }
}
