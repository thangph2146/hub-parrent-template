/** Khớp types trong `@workspace/api-client` — API không import api-client. */

export type QuantityCountMode = 'sell_unit' | 'base_unit';

export type QuantityScope = 'line' | 'product';

/** Điều kiện số lượng cho giá bậc / quà tặng. */

export type QuantityCondition = {
  scope?: QuantityScope;

  minQty?: number;

  maxQty?: number;

  exactQty?: number;

  stepQty?: number;

  countMode?: QuantityCountMode;
};

export type ProductPriceTier = {
  minQty: number;

  unitPrice: number;

  label?: string;
};

export type ProductGiftRule = {
  id: string;

  label: string;

  trigger: QuantityCondition;

  gift: {
    name: string;

    sku?: string;

    productId?: number;

    qty: number;

    image?: string;

    qtyMultiplier?: 'once' | 'per_min_qty' | 'per_step';
  };

  applyPer?: 'order' | 'line';
};

export type ProductUnitType = {
  type: string;

  label: string;

  sku?: string;

  wholesalePrice: number | null;

  retailPrice: number;

  minWholesaleQty: number;

  qtyPerUnit: number;

  stock?: number;

  images?: string[];

  priceTiers?: ProductPriceTier[];

  giftRules?: ProductGiftRule[];

  isDefault?: boolean;

  isActive?: boolean;
};

export type OrderItemSnapshot = {
  productId: number;

  sku: string;

  name: string;

  quantity: number;

  unitType: string;

  unitPrice: number;

  totalPrice: number;

  qtyPerUnit?: number;

  image?: string;

  giftNote?: string;

  listUnitPrice?: number;

  unitLabel?: string;

  variantSku?: string;
};

export type OrderGiftSnapshot = {
  ruleId?: string;

  label: string;

  sku?: string;

  name: string;

  qty: number;

  image?: string;

  productId?: number;

  unitType?: string;
};
