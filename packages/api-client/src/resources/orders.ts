import type { ApiClient } from "../client";
import type {
  CreateOrderInput,
  Order,
  StaffOrderStatusCounts,
  UpdateOrderInput,
} from "../types";
import { normalizeOrder } from "../normalize-order";
import {
  buildAdminListQuery,
  deleteData,
  getData,
  normalizePagedResult,
  postData,
  putData,
  type AdminListQueryParams,
} from "./_shared";

export class OrdersApi {
  constructor(private readonly http: ApiClient) {}

  async list(
    params?: AdminListQueryParams & { status?: string; search?: string },
  ): Promise<{ items: Order[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/orders", {
      query: buildAdminListQuery(params, { page: 1, limit: 20 }),
    });
    const normalized = normalizePagedResult<Order>(payload);
    return {
      items: normalized.items.map((row) => normalizeOrder(row)),
      total: normalized.total,
    };
  }

  async get(id: number): Promise<Order> {
    const row = await getData<Order>(this.http, `/admin/orders/${id}`);
    return normalizeOrder(row);
  }

  async getStaffStatusCounts(): Promise<StaffOrderStatusCounts> {
    return getData<StaffOrderStatusCounts>(
      this.http,
      "/admin/orders/staff/status-counts",
    );
  }

  async create(body: CreateOrderInput): Promise<Order> {
    const row = await postData<Order>(this.http, "/admin/orders", body);
    return normalizeOrder(row);
  }

  async updateStatus(id: number, status: Order["status"]): Promise<Order> {
    const row = await putData<Order>(this.http, `/admin/orders/${id}/status`, {
      status,
    });
    return normalizeOrder(row);
  }

  async remove(id: number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/orders/${id}`);
  }

  /** Checkout khách — POST /public/orders */
  async checkout(body: CreateOrderInput): Promise<Order> {
    const row = await postData<Order>(this.http, "/public/orders", body);
    return normalizeOrder(row);
  }

  /** Storefront — danh sách đơn theo email khách */
  async listPublic(params: { email: string }): Promise<Order[]> {
    const rows = await getData<Order[]>(this.http, "/public/orders", {
      query: { email: params.email },
    });
    return rows.map((row) => normalizeOrder(row));
  }

  /** Storefront — chi tiết đơn (kèm email để xác thực) */
  async getPublic(id: number, email?: string): Promise<Order> {
    const row = await getData<Order>(this.http, `/public/orders/${id}`, {
      query: email ? { email } : undefined,
    });
    return normalizeOrder(row);
  }

  /** Cập nhật đơn (mở rộng sau). */
  async update(id: number, body: UpdateOrderInput): Promise<Order> {
    const row = await putData<Order>(this.http, `/admin/orders/${id}`, body);
    return normalizeOrder(row);
  }
}
