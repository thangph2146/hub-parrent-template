import { toEntityId } from '../common/entity-id';
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Order, type OrderStatus } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import type {
  OrderGiftSnapshot,
  OrderItemSnapshot,
} from '../common/product-types';
import { evaluateOrderGifts } from '../common/gift-rules';
import { computePromoDiscount } from '../common/promo-checkout';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { ProductsService } from '../products/products.service';
import { UploadsService } from '../uploads/uploads.service';
import { buildStandardAdminWhere } from '../common/apply-column-filters';
import { ORDER_COLUMN_FILTERS } from '../common/admin-filter-configs';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';
import {
  buildOrderItemsFromProducts,
  buildOrderNumber,
  mergeCreateOrderLines,
  type CreateOrderLineInput,
} from './order-checkout';

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

function toIso(value: Date | string | undefined | null): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return null;
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

function mapUserRef(user: User | null | undefined) {
  if (!user) return null;
  const name = user.name?.trim();
  const email = user.email?.trim();
  if (!name && !email) return null;
  return {
    id: user.id,
    fullName: name || email || String(user.id),
    email: email || '',
  };
}

function mapOrder(row: Order): OrderRowDto {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customer: mapUserRef(row.customer),
    assignedShipper: mapUserRef(row.assignedShipper),
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone ?? null,
    shippingAddress: row.shippingAddress ?? null,
    items: parseJsonArray<OrderItemSnapshot>(row.items),
    gifts: parseJsonArray<OrderGiftSnapshot>(row.gifts),
    subtotal: row.subtotal,
    discountAmount: row.discountAmount,
    shippingFee: row.shippingFee,
    totalAmount: row.totalAmount,
    status: row.status,
    couponCode: row.couponCode ?? null,
    notes: row.notes ?? null,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    isPaid: row.isPaid,
    shippedBy: row.shippedBy ?? null,
    shippedAt: toIso(row.shippedAt),
    deliveredBy: row.deliveredBy ?? null,
    deliveredAt: toIso(row.deliveredAt),
    cancelledAt: toIso(row.cancelledAt),
    createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(row.updatedAt) ?? new Date().toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly productsService: ProductsService,
    private readonly uploadsService: UploadsService,
    private readonly promoCodesService: PromoCodesService,
  ) {}

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
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const whereBase = buildStandardAdminWhere({
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

    const where = whereBase as FilterQuery<Order>;

    const [rows, total] = await this.em.findAndCount(Order, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: skip,
    });
    return {
      data: rows.map(mapOrder),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<OrderRowDto | null> {
    const row = await this.em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    return row ? mapOrder(row) : null;
  }

  async listByCustomerEmail(email: string): Promise<OrderRowDto[]> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return [];
    const rows = await this.em.find(
      Order,
      { customerEmail: normalized, deletedAt: null },
      {
        orderBy: { createdAt: 'DESC' },
        limit: 100,
      },
    );
    return rows.map(mapOrder);
  }

  async getPublicById(id: number, email?: string): Promise<OrderRowDto | null> {
    const row = await this.em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return null;
    if (email?.trim()) {
      const normalized = email.trim().toLowerCase();
      if (row.customerEmail.trim().toLowerCase() !== normalized) {
        return null;
      }
    }
    return mapOrder(row);
  }

  async getStaffStatusCounts(): Promise<Record<string, number>> {
    const base: FilterQuery<Order> = { deletedAt: null };
    const [all, pending, confirmed, shipped, delivered, cancelled] =
      await Promise.all([
        this.em.count(Order, base),
        this.em.count(Order, { deletedAt: null, status: 'pending' }),
        this.em.count(Order, { deletedAt: null, status: 'confirmed' }),
        this.em.count(Order, { deletedAt: null, status: 'shipped' }),
        this.em.count(Order, { deletedAt: null, status: 'delivered' }),
        this.em.count(Order, { deletedAt: null, status: 'cancelled' }),
      ]);
    return {
      ALL: all,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
    };
  }

  async checkout(
    input: CreateOrderDto,
    options?: { uploadedByUserId?: string; serveBaseUrl?: string },
  ): Promise<OrderRowDto> {
    const merged = mergeCreateOrderLines(input.items ?? []);
    const productIds = [...new Set(merged.map((l) => l.productId))];

    const productsPreview =
      await this.productsService.findActiveByIds(productIds);
    const previewById = new Map(productsPreview.map((p) => [p.id, p]));
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
      const promo =
        await this.promoCodesService.findRedeemableByCode(couponRaw);
      if (!promo) {
        throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
      }
      const promoResult = computePromoDiscount(previewSubtotal, promo);
      if (promoResult.discountAmount <= 0) {
        throw new Error(
          `Mã "${promo.code}" không áp dụng được — đơn chưa đạt điều kiện tối thiểu`,
        );
      }
      discountAmount = promoResult.discountAmount;
      appliedCouponCode = promo.code;
      redeemPromoId = promo.id;
    }

    const shippingFee = 0;

    let customer: User | null = null;
    if (input.customerId?.trim()) {
      customer = await this.em.findOne(User, {
        id: toEntityId(input.customerId.trim()),
      });
    }

    const now = new Date();
    let items: OrderItemSnapshot[] = [];
    let gifts: OrderGiftSnapshot[] = [];

    const order = await this.em.transactional(async (em) => {
      const lockedProducts =
        await this.productsService.findActiveByIdsForUpdate(em, productIds);
      const productsById = new Map(lockedProducts.map((p) => [p.id, p]));
      items = buildOrderItemsFromProducts(merged, productsById);
      gifts = evaluateOrderGifts(merged, productsById);
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

      for (const line of merged) {
        await this.productsService.decrementStock(
          em,
          line.productId,
          line.quantity,
          line.unitType,
        );
      }

      const row = em.create(Order, {
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
      });
      em.persist(row);
      await em.flush();
      if (redeemPromoId) {
        await this.promoCodesService.incrementUsage(em, redeemPromoId);
      }
      return row;
    });

    const lineKey = (productId: number, sku: string) => `${productId}:${sku}`;

    const itemSnapshots = await this.uploadsService.snapshotOrderLineImages({
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
      const giftSnapshots = await this.uploadsService.snapshotOrderLineImages({
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

    await this.em.flush();

    return mapOrder(order);
  }

  async updateStatus(
    id: number,
    status: OrderStatus,
    actorUserId?: string,
  ): Promise<OrderRowDto | null> {
    const row = await this.em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return null;
    row.status = status;
    const now = new Date();
    if (status === 'shipped') {
      row.shippedAt = now;
      row.shippedBy = actorUserId ?? null;
    }
    if (status === 'delivered') {
      row.deliveredAt = now;
      row.deliveredBy = actorUserId ?? null;
    }
    if (status === 'cancelled') {
      row.cancelledAt = now;
    }
    await this.em.flush();
    return mapOrder(row);
  }

  async softDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(Order, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return false;
    row.deletedAt = new Date();
    await this.em.flush();
    return true;
  }
}
