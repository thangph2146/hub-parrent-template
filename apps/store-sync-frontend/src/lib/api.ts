import {
  createStorefrontSdk,
  DEFAULT_API_URL,
} from "@workspace/api-client";

export const api = createStorefrontSdk({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
});

export type {
  Product,
  ProductListParams,
  ProductPagedResponse,
  ProductUnitType,
  ProductGiftRule,
  Order,
  OrderStatus,
  Category,
  CategoryUsage,
  CreateOrderInput,
} from "@workspace/api-client";
export { ApiError } from "@workspace/api-client";
