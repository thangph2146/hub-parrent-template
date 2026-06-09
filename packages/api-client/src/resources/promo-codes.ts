import type { ApiClient } from "../client";
import type {
  CreatePromoCodeInput,
  PromoCode,
  PromoDiscountKind,
  UpdatePromoCodeInput,
} from "../types";

export type PromoRulePublic = {
  code: string;
  label: string;
  discountKind: PromoDiscountKind;
  discountFixed: number;
  discountPercent: number;
  discountCapVnd: number | null;
  minOrderSubtotal: number;
};
import {
  buildAdminListQuery,
  deleteData,
  getData,
  normalizePagedResult,
  postData,
  putData,
  type AdminListQueryParams,
} from "./_shared";

export class PromoCodesApi {
  constructor(private readonly http: ApiClient) {}

  async list(
    params?: AdminListQueryParams & { q?: string; active?: boolean },
  ): Promise<{ items: PromoCode[]; total: number }> {
    const payload = await this.http.get<unknown>("/admin/promo-codes", {
      query: buildAdminListQuery(params, { page: 1, limit: 20 }),
    });
    const normalized = normalizePagedResult<PromoCode>(payload);
    return { items: normalized.items, total: normalized.total };
  }

  async get(id: number): Promise<PromoCode> {
    return getData<PromoCode>(this.http, `/admin/promo-codes/${id}`);
  }

  async create(body: CreatePromoCodeInput): Promise<PromoCode> {
    return postData<PromoCode>(this.http, "/admin/promo-codes", body);
  }

  async update(id: number, body: UpdatePromoCodeInput): Promise<PromoCode> {
    return putData<PromoCode>(this.http, `/admin/promo-codes/${id}`, body);
  }

  async remove(id: number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/promo-codes/${id}`);
  }

  /** Storefront — GET /public/promo-codes */
  async publicList(): Promise<PromoRulePublic[]> {
    return getData<PromoRulePublic[]>(this.http, "/public/promo-codes");
  }
}
