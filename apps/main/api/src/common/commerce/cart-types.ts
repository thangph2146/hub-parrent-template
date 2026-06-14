import type { ProductGiftRule } from './product-types';

/** Dòng giỏ lưu server — không lưu `stock` (client sync từ catalog). */
export type CustomerCartLine = {
  productId: number;
  sku: string;
  name: string;
  image?: string;
  category: string;
  unitType: string;
  unitLabel: string;
  unitPrice: number;
  listUnitPrice: number;
  promoUnitPrice: number | null;
  minPromoQty: number;
  qtyPerUnit: number;
  quantity: number;
  isWholesale: boolean;
  fulfillmentNote?: string | null;
  giftRules?: ProductGiftRule[];
};

export type CustomerCartPayload = {
  lines: CustomerCartLine[];
  appliedPromoCode: string | null;
};
