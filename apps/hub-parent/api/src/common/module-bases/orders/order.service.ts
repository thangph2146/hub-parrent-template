/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Orders Service — commerce checkout (materialize → apps/main/api module-bases).
 */
import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager } from '@mikro-orm/core';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
} from '../../index';
import { buildStandardAdminListWhere } from '../../crud/crud-apply-column-filters';
import type {
  OrderGiftSnapshot,
  OrderItemSnapshot,
} from '../../commerce/product-types';
import { evaluateOrderGifts } from '../../commerce/gift-rules';
import {
  computePromoDiscount,
  type RedeemablePromo,
} from '../../commerce/promo-checkout';
import { ORDER_COLUMN_FILTERS } from './order-column-filters';
import {
  buildOrderItemsFromProducts,
  buildOrderNumber,
  mergeCreateOrderLines,
  type CheckoutProduct,
  type CreateOrderLineInput,
} from './order-checkout';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderRowDto {
  id: number;
  orderNumber: string;
  customer?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  assignedShipper?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  items: OrderItemSnapshot[];
  gifts: OrderGiftSnapshot[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  couponCode: string | null;
  notes: string | null;
  paymentMethod: 'cod';
  paymentStatus: 'unpaid' | 'paid';
  isPaid: boolean;
  shippedBy: string | null;
  shippedAt: string | null;
  deliveredBy: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateOrderDto = {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  notes?: string;
  couponCode?: string;
  paymentMethod?: 'cod';
  items: CreateOrderLineInput[];
};

export interface StaffOrderStatusCounts {
  ALL: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface OrdersProductsPort {
  findActiveByIds(ids: number[]): Promise<object[]>;
  findActiveByIdsForUpdate(em: EntityManager, ids: number[]): Promise<object[]>;
  decrementStock(
    em: EntityManager,
    productId: number,
    quantity: number,
    unitType?: string,
  ): Promise<void>;
}

export interface OrdersPromoPort {
  findRedeemableByCode(code: string): Promise<RedeemablePromo | null>;
  incrementUsage(em: EntityManager, id: number): Promise<void>;
}

export interface OrdersUploadsPort {
  snapshotOrderLineImages(params: {
    orderId: string;
    lines: Array<{
      productId: number;
      sku: string;
      sourceImageRef?: string | null;
    }>;
    uploadedByUserId?: string;
    serveBaseUrl?: string;
  }): Promise<Array<{ productId: number; sku: string; image: string | null }>>;
}

function mapUserRef(user: Record<string, unknown> | null | undefined) {
  if (!user) return null;
  const name = String(user.name ?? '').trim();
  const email = String(user.email ?? '').trim();
  if (!name && !email) return null;
  return {
    id: user.id as number,
    fullName: name || email || String(user.id),
    email: email || '',
  };
}

function parseJsonArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapOrder(row: Record<string, unknown>): OrderRowDto {
  return {
    id: row.id as number,
    orderNumber: String(row.orderNumber ?? ''),
    customer: mapUserRef(row.customer as Record<string, unknown> | undefined),
    assignedShipper: mapUserRef(
      row.assignedShipper as Record<string, unknown> | undefined,
    ),
    customerName: String(row.customerName ?? ''),
    customerEmail: String(row.customerEmail ?? ''),
    customerPhone: (row.customerPhone as string | null | undefined) ?? null,
    shippingAddress: (row.shippingAddress as string | null | undefined) ?? null,
    items: parseJsonArray<OrderItemSnapshot>(row.items),
    gifts: parseJsonArray<OrderGiftSnapshot>(row.gifts),
    subtotal: Number(row.subtotal ?? 0),
    discountAmount: Number(row.discountAmount ?? 0),
    shippingFee: Number(row.shippingFee ?? 0),
    totalAmount: Number(row.totalAmount ?? 0),
    status: row.status as OrderStatus,
    couponCode: (row.couponCode as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    paymentMethod: (row.paymentMethod as 'cod') ?? 'cod',
    paymentStatus: (row.paymentStatus as 'unpaid' | 'paid') ?? 'unpaid',
    isPaid: Boolean(row.isPaid),
    shippedBy: (row.shippedBy as string | null | undefined) ?? null,
    shippedAt: safeIsoString(row.shippedAt as Date | string | null | undefined),
    deliveredBy: (row.deliveredBy as string | null | undefined) ?? null,
    deliveredAt: safeIsoString(
      row.deliveredAt as Date | string | null | undefined,
    ),
    cancelledAt: safeIsoString(
      row.cancelledAt as Date | string | null | undefined,
    ),
    createdAt: safeIsoStringNow(row.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(row.updatedAt as Date | string | null | undefined),
    deletedAt: safeIsoString(row.deletedAt as Date | string | null | undefined),
  };
}

function toCheckoutProductMap(rows: object[]): Map<number, CheckoutProduct> {
  return new Map(
    rows.map((row) => {
      const record = row as CheckoutProduct;
      return [record.id, record];
    }),
  );
}

@Injectable()
export abstract class BaseOrdersService {
  protected readonly logger = new Logger(BaseOrdersService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getOrderEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getProductsPort(): OrdersProductsPort;
  protected abstract getPromoPort(): OrdersPromoPort;
  protected abstract getUploadsPort(): OrdersUploadsPort;

  async list(params: {
    page: number;
    limit: number;
    status?: OrderStatus | 'all';
    search?: string;
    trash?: boolean;
    filters?: Record<string, string>;
  }): Promise<{
    data: OrderRowDto[];
    pagination: ReturnType<typeof paginationMeta>;
  }> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const whereBase = buildStandardAdminListWhere({
      status: params.trash ? 'deleted' : 'active',
      search: params.search,
      searchFields: [
        'orderNumber',
        'customerName',
        'customerEmail',
        'customerPhone',
      ],
      filters: params.filters,
      filterConfig: ORDER_COLUMN_FILTERS,
    });

    if (!params.filters?.status && params.status && params.status !== 'all') {
      whereBase.status = params.status;
    }

    const where = whereBase as Record<string, unknown>;
    const [rows, total] = await em.findAndCount(Order, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: skip,
    });
    return {
      data: rows.map((row) => mapOrder(row as Record<string, unknown>)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<OrderRowDto | null> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const row = await em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    return row ? mapOrder(row as Record<string, unknown>) : null;
  }

  async listByCustomerEmail(email: string): Promise<OrderRowDto[]> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return [];
    const rows = await em.find(
      Order,
      { customerEmail: normalized, deletedAt: null },
      { orderBy: { createdAt: 'DESC' }, limit: 100 },
    );
    return rows.map((row) => mapOrder(row as Record<string, unknown>));
  }

  async getPublicById(id: number, email?: string): Promise<OrderRowDto | null> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const row = await em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return null;
    const record = row as Record<string, unknown>;
    if (email?.trim()) {
      const normalized = email.trim().toLowerCase();
      if (String(record.customerEmail ?? '').trim().toLowerCase() !== normalized) {
        return null;
      }
    }
    return mapOrder(record);
  }

  async getStaffStatusCounts(): Promise<StaffOrderStatusCounts> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const base = { deletedAt: null };
    const [all, pending, confirmed, shipped, delivered, cancelled] =
      await Promise.all([
        em.count(Order, base),
        em.count(Order, { ...base, status: 'pending' }),
        em.count(Order, { ...base, status: 'confirmed' }),
        em.count(Order, { ...base, status: 'shipped' }),
        em.count(Order, { ...base, status: 'delivered' }),
        em.count(Order, { ...base, status: 'cancelled' }),
      ]);
    return { ALL: all, pending, confirmed, shipped, delivered, cancelled };
  }

  async checkout(
    input: CreateOrderDto,
    options?: { uploadedByUserId?: string; serveBaseUrl?: string },
  ): Promise<OrderRowDto> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const User = this.getUserEntity();
    const products = this.getProductsPort();
    const promo = this.getPromoPort();
    const uploads = this.getUploadsPort();

    const merged = mergeCreateOrderLines(input.items ?? []);
    const productIds = [...new Set(merged.map((l) => l.productId))];

    const productsPreview = await products.findActiveByIds(productIds);
    const previewById = toCheckoutProductMap(productsPreview);
    const previewItems = buildOrderItemsFromProducts(merged, previewById);
    const previewSubtotal = previewItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const couponRaw = input.couponCode?.trim();
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let redeemPromoId: number | null = null;

    if (couponRaw) {
      const promoRow = await promo.findRedeemableByCode(couponRaw);
      if (!promoRow) {
        throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      }
      const promoResult = computePromoDiscount(previewSubtotal, promoRow);
      if (promoResult.discountAmount <= 0) {
        throw new Error(
          `Mã "${promoRow.code}" không áp dụng được — đơn chưa đạt điều kiện tối thiểu`,
        );
      }
      discountAmount = promoResult.discountAmount;
      appliedCouponCode = promoRow.code;
      redeemPromoId = promoRow.id;
    }

    const shippingFee = 0;

    let customer: Record<string, unknown> | null = null;
    if (input.customerId?.trim()) {
      customer = (await em.findOne(User, {
        id: toEntityId(input.customerId.trim()),
      })) as Record<string, unknown> | null;
    }

    const now = new Date();
    let items: OrderItemSnapshot[] = [];
    let gifts: OrderGiftSnapshot[] = [];

    const order = await em.transactional(async (txEm) => {
      const lockedProducts = await products.findActiveByIdsForUpdate(
        txEm,
        productIds,
      );
      const productsById = toCheckoutProductMap(lockedProducts);
      items = buildOrderItemsFromProducts(merged, productsById);
      gifts = evaluateOrderGifts(merged, productsById);
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

      for (const line of merged) {
        await products.decrementStock(
          txEm,
          line.productId,
          line.quantity,
          line.unitType,
        );
      }

      const row = txEm.create(Order, {
        orderNumber: buildOrderNumber(),
        customer: customer ?? undefined,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim(),
        customerPhone: input.customerPhone?.trim() || null,
        shippingAddress: input.shippingAddress?.trim() || null,
        items,
        gifts,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        status: 'pending',
        couponCode: appliedCouponCode,
        notes: input.notes?.trim() || null,
        paymentMethod: input.paymentMethod ?? 'cod',
        paymentStatus: 'unpaid',
        isPaid: false,
        createdAt: now,
        updatedAt: now,
      }) as Record<string, unknown>;
      txEm.persist(row);
      await txEm.flush();
      if (redeemPromoId) {
        await promo.incrementUsage(txEm, redeemPromoId);
      }
      return row;
    });

    const lineKey = (productId: number, sku: string) => `${productId}:${sku}`;

    const itemSnapshots = await uploads.snapshotOrderLineImages({
      orderId: String(order.id),
      lines: items.map((item) => ({
        productId: item.productId,
        sku: item.variantSku ?? item.sku,
        sourceImageRef: item.image,
      })),
      uploadedByUserId: options?.uploadedByUserId,
      serveBaseUrl: options?.serveBaseUrl,
    });

    const imageByKey = new Map(
      itemSnapshots.map((s) => [lineKey(s.productId, s.sku), s.image]),
    );
    order.items = items.map((item) => {
      const key = lineKey(item.productId, item.variantSku ?? item.sku);
      const snap = imageByKey.get(key);
      return snap ? { ...item, image: snap ?? item.image } : item;
    });

    if (gifts.length) {
      const giftSnapshots = await uploads.snapshotOrderLineImages({
        orderId: String(order.id),
        lines: gifts.map((gift, index) => ({
          productId: gift.productId ?? 0,
          sku: `gift-${gift.ruleId ?? index}`,
          sourceImageRef: gift.image,
        })),
        uploadedByUserId: options?.uploadedByUserId,
        serveBaseUrl: options?.serveBaseUrl,
      });
      order.gifts = gifts.map((gift, index) => {
        const snap = giftSnapshots[index]?.image;
        return snap ? { ...gift, image: snap } : gift;
      });
    }

    await em.flush();

    return mapOrder(order);
  }

  async updateStatus(
    id: number,
    status: OrderStatus,
    actorUserId?: string,
  ): Promise<OrderRowDto | null> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const row = await em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return null;
    const record = row as Record<string, unknown>;
    record.status = status;
    const now = new Date();
    if (status === 'shipped') {
      record.shippedAt = now;
      record.shippedBy = actorUserId ?? null;
    }
    if (status === 'delivered') {
      record.deliveredAt = now;
      record.deliveredBy = actorUserId ?? null;
    }
    if (status === 'cancelled') {
      record.cancelledAt = now;
    }
    await em.flush();
    return mapOrder(record);
  }

  async softDelete(id: number): Promise<boolean> {
    const em = this.getEm();
    const Order = this.getOrderEntity();
    const row = await em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return false;
    (row as Record<string, unknown>).deletedAt = new Date();
    await em.flush();
    return true;
  }
}
