import type { ApiClient } from "../client";
import type { CustomerCartPayload, CustomerCartResponse } from "../types";
import { deleteData, getData, putData } from "./_shared";

export class CartsApi {
  constructor(private readonly http: ApiClient) {}

  /** GET /public/cart — giỏ của user đang đăng nhập (header x-user-id). */
  async getMine(): Promise<CustomerCartResponse> {
    return getData<CustomerCartResponse>(this.http, "/public/cart");
  }

  /** PUT /public/cart — lưu toàn bộ giỏ (không lưu stock). */
  async saveMine(payload: CustomerCartPayload): Promise<CustomerCartResponse> {
    return putData<CustomerCartResponse>(this.http, "/public/cart", payload);
  }

  /** DELETE /public/cart — xoá giỏ server (đăng xuất / sau checkout). */
  async clearMine(): Promise<void> {
    await deleteData<unknown>(this.http, "/public/cart");
  }
}
