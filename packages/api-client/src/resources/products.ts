import type { ApiClient } from "../client";
import type {
  CreateProductInput,
  Product,
  ProductListParams,
  ProductPagedResponse,
  UpdateProductInput,
} from "../types";
import {
  normalizeProduct,
  normalizeProducts,
} from "../normalize-product";
import {
  buildAdminListQuery,
  deleteData,
  getData,
  normalizePagedResult,
  postData,
  putData,
  type AdminListQueryParams,
} from "./_shared";

function mapPagedProducts(payload: unknown): ProductPagedResponse {
  const normalized = normalizePagedResult<Product>(payload);
  return {
    items: normalizeProducts(normalized.items),
    total: normalized.total,
  };
}

export class ProductsApi {
  constructor(private readonly http: ApiClient) {}

  async list(
    params?: ProductListParams & AdminListQueryParams,
  ): Promise<ProductPagedResponse> {
    const payload = await this.http.get<unknown>("/admin/products", {
      query: buildAdminListQuery(params, { page: 1, limit: 20, status: "active" }),
    });
    return mapPagedProducts(payload);
  }

  async get(id: number): Promise<Product> {
    const row = await getData<Product>(this.http, `/admin/products/${id}`);
    return normalizeProduct(row);
  }

  async create(body: CreateProductInput): Promise<Product> {
    const row = await postData<Product>(this.http, "/admin/products", body);
    return normalizeProduct(row);
  }

  async update(id: number, body: UpdateProductInput): Promise<Product> {
    const row = await putData<Product>(this.http, `/admin/products/${id}`, body);
    return normalizeProduct(row);
  }

  async remove(id: number): Promise<void> {
    await deleteData<unknown>(this.http, `/admin/products/${id}`);
  }

  async restore(id: number): Promise<Product> {
    const row = await postData<Product>(this.http, `/admin/products/${id}/restore`);
    return normalizeProduct(row);
  }

  /** Storefront — GET /public/products */
  async listPublic(
    params?: ProductListParams,
  ): Promise<ProductPagedResponse> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.page != null) query.page = params.page;
    if (params?.limit != null) query.limit = params.limit;
    if (params?.category) query.category = params.category;
    if (params?.q) query.q = params.q;
    if (params?.activeOnly || params?.isActive === true) query.active = "true";
    const payload = await this.http.get<unknown>("/public/products", { query });
    return mapPagedProducts(payload);
  }

  async getPublic(id: number): Promise<Product> {
    const row = await getData<Product>(this.http, `/public/products/${id}`);
    return normalizeProduct(row);
  }

  async bySkuPublic(sku: string): Promise<Product | null> {
    try {
      const row = await getData<Product>(
        this.http,
        `/public/products/sku/${encodeURIComponent(sku)}`,
      );
      return normalizeProduct(row);
    } catch {
      return null;
    }
  }
}
