/**
 * Products Service — commerce catalog (materialize → apps/main/api module-bases).
 */
import { Injectable, Logger } from '@nestjs/common';
import { LockMode, type EntityManager } from '@mikro-orm/core';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
  toEntityIdList,
} from '../../index';
import {
  applyProductStockDeduction,
  resolveUnit,
  syncProductStockFromUnits,
  type ProductStockLike,
} from '../../commerce/product-units';
import type { ProductUnitType } from '../../commerce/product-types';

export interface ProductRowDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  origin: string | null;
  basePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  unit: string;
  unitTypes: ProductUnitType[] | null;
  images: string[] | null;
  coupons: string[] | null;
  fulfillmentNote: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ProductListParams = {
  page: number;
  limit: number;
  activeOnly?: boolean;
  category?: string;
  q?: string;
  trash?: boolean;
};

export type ProductListResult = {
  data: ProductRowDto[];
  pagination: ReturnType<typeof paginationMeta>;
};

export type ProductWriteData = Partial<{
  sku: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  origin: string | null;
  basePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  unit: string;
  unitTypes: ProductUnitType[] | null;
  images: string[] | null;
  coupons: string[] | null;
  fulfillmentNote: string | null;
  isActive: boolean;
}>;

function mapProduct(row: Record<string, unknown>): ProductRowDto {
  return {
    id: row.id as number,
    sku: String(row.sku ?? ''),
    name: String(row.name ?? ''),
    description: (row.description as string | null | undefined) ?? null,
    category: String(row.category ?? 'general'),
    brand: (row.brand as string | null | undefined) ?? null,
    origin: (row.origin as string | null | undefined) ?? null,
    basePrice: Number(row.basePrice ?? 0),
    wholesalePrice: Number(row.wholesalePrice ?? 0),
    retailPrice: Number(row.retailPrice ?? 0),
    stock: Number(row.stock ?? 0),
    unit: String(row.unit ?? 'cai'),
    unitTypes: (row.unitTypes as ProductUnitType[] | null | undefined) ?? null,
    images: (row.images as string[] | null | undefined) ?? null,
    coupons: (row.coupons as string[] | null | undefined) ?? null,
    fulfillmentNote: (row.fulfillmentNote as string | null | undefined) ?? null,
    isActive: Boolean(row.isActive),
    createdAt: safeIsoStringNow(
      row.createdAt as Date | string | null | undefined,
    ),
    updatedAt: safeIsoStringNow(
      row.updatedAt as Date | string | null | undefined,
    ),
    deletedAt: safeIsoString(row.deletedAt as Date | string | null | undefined),
  };
}

@Injectable()
export abstract class BaseProductsService {
  protected readonly logger = new Logger(BaseProductsService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;

  async list(params: ProductListParams): Promise<ProductListResult> {
    const em = this.getEm();
    const Product = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: Record<string, unknown> = {};
    if (params.trash) {
      where.deletedAt = { $ne: null };
    } else {
      where.deletedAt = null;
    }
    if (params.activeOnly) where.isActive = true;
    if (params.category?.trim()) where.category = params.category.trim();
    if (params.q?.trim()) {
      const q = `%${params.q.trim()}%`;
      where.$or = [
        { sku: { $like: q } },
        { name: { $like: q } },
        { category: { $like: q } },
        { brand: { $like: q } },
      ];
    }

    const [rows, total] = await em.findAndCount(Product, where, {
      orderBy: { updatedAt: 'DESC' },
      limit,
      offset: skip,
    });
    return {
      data: rows.map((row) => mapProduct(row as Record<string, unknown>)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async listPublic(
    params: Omit<ProductListParams, 'trash'>,
  ): Promise<ProductListResult> {
    return this.list({ ...params, trash: false });
  }

  async getById(id: number): Promise<ProductRowDto | null> {
    const em = this.getEm();
    const Product = this.getEntity();
    const row = await em.findOne(Product, {
      id: toEntityId(id),
      deletedAt: null,
    });
    return row ? mapProduct(row as Record<string, unknown>) : null;
  }

  async getBySku(sku: string): Promise<ProductRowDto | null> {
    const em = this.getEm();
    const Product = this.getEntity();
    const normalized = sku.trim();
    if (!normalized) return null;
    const row = await em.findOne(Product, {
      sku: normalized,
      deletedAt: null,
      isActive: true,
    });
    return row ? mapProduct(row as Record<string, unknown>) : null;
  }

  async getPublicById(id: number): Promise<ProductRowDto | null> {
    const em = this.getEm();
    const Product = this.getEntity();
    const row = await em.findOne(Product, {
      id,
      deletedAt: null,
      isActive: true,
    });
    return row ? mapProduct(row as Record<string, unknown>) : null;
  }

  async findActiveByIds(ids: number[]): Promise<object[]> {
    const em = this.getEm();
    const Product = this.getEntity();
    const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
    if (!unique.length) return [];
    return em.find(Product, {
      id: { $in: toEntityIdList(unique) },
      deletedAt: null,
      isActive: true,
    }) as Promise<object[]>;
  }

  async findActiveByIdsForUpdate(
    em: EntityManager,
    ids: number[],
  ): Promise<object[]> {
    const Product = this.getEntity();
    const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))].sort(
      (a, b) => a - b,
    );
    if (!unique.length) return [];
    const rows: object[] = [];
    for (const id of unique) {
      const row = await em.findOne(
        Product,
        { id, deletedAt: null, isActive: true },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (row) rows.push(row);
    }
    return rows;
  }

  async create(data: ProductWriteData): Promise<ProductRowDto> {
    const em = this.getEm();
    const Product = this.getEntity();
    const now = new Date();
    const row = em.create(Product, {
      sku: data.sku?.trim() ?? '',
      name: data.name?.trim() ?? '',
      description: data.description ?? null,
      category: data.category?.trim() ?? 'general',
      brand: data.brand ?? null,
      origin: data.origin ?? null,
      basePrice: Number(data.basePrice) || 0,
      wholesalePrice: Number(data.wholesalePrice) || 0,
      retailPrice: Number(data.retailPrice) || 0,
      stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
      unit: data.unit?.trim() || 'cai',
      unitTypes: data.unitTypes ?? null,
      images: data.images ?? null,
      coupons: data.coupons ?? null,
      fulfillmentNote: data.fulfillmentNote ?? null,
      isActive: data.isActive !== false,
      createdAt: now,
      updatedAt: now,
    }) as Record<string, unknown>;
    syncProductStockFromUnits(row as ProductStockLike);
    await em.persistAndFlush(row);
    return mapProduct(row);
  }

  async update(
    id: number,
    data: ProductWriteData,
  ): Promise<ProductRowDto | null> {
    const em = this.getEm();
    const Product = this.getEntity();
    const row = await em.findOne(Product, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return null;
    const record = row as Record<string, unknown>;
    if (data.sku !== undefined) record.sku = String(data.sku).trim();
    if (data.name !== undefined) record.name = String(data.name).trim();
    if (data.description !== undefined) record.description = data.description;
    if (data.category !== undefined) {
      record.category = String(data.category).trim();
    }
    if (data.brand !== undefined) record.brand = data.brand;
    if (data.origin !== undefined) record.origin = data.origin;
    if (data.basePrice !== undefined) {
      record.basePrice = Number(data.basePrice) || 0;
    }
    if (data.wholesalePrice !== undefined) {
      record.wholesalePrice = Number(data.wholesalePrice) || 0;
    }
    if (data.retailPrice !== undefined) {
      record.retailPrice = Number(data.retailPrice) || 0;
    }
    if (data.stock !== undefined) {
      record.stock = Math.max(0, Math.floor(Number(data.stock) || 0));
    }
    if (data.unit !== undefined) {
      record.unit = String(data.unit).trim() || 'cai';
    }
    if (data.unitTypes !== undefined) {
      record.unitTypes = data.unitTypes;
      syncProductStockFromUnits(record as ProductStockLike);
    }
    if (data.images !== undefined) record.images = data.images;
    if (data.coupons !== undefined) record.coupons = data.coupons;
    if (data.fulfillmentNote !== undefined) {
      record.fulfillmentNote = data.fulfillmentNote;
    }
    if (data.isActive !== undefined) record.isActive = Boolean(data.isActive);
    await em.flush();
    return mapProduct(record);
  }

  async softDelete(id: number): Promise<boolean> {
    const em = this.getEm();
    const Product = this.getEntity();
    const row = await em.findOne(Product, {
      id: toEntityId(id),
      deletedAt: null,
    });
    if (!row) return false;
    const record = row as Record<string, unknown>;
    record.deletedAt = new Date();
    record.isActive = false;
    await em.flush();
    return true;
  }

  async restore(id: number): Promise<ProductRowDto | null> {
    const em = this.getEm();
    const Product = this.getEntity();
    const row = await em.findOne(Product, { id: toEntityId(id) });
    if (!row) return null;
    const record = row as Record<string, unknown>;
    if (!record.deletedAt) return null;
    record.deletedAt = null;
    record.isActive = true;
    await em.flush();
    return mapProduct(record);
  }

  async decrementStock(
    em: EntityManager,
    productId: number,
    quantity: number,
    unitType?: string,
  ): Promise<void> {
    const Product = this.getEntity();
    const row = await em.findOne(
      Product,
      { id: productId, deletedAt: null },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (!row) throw new Error(`Sản phẩm #${productId} không tồn tại`);
    const record = row as Record<string, unknown>;
    const q = Math.max(1, Math.floor(quantity));
    const typeKey = unitType?.trim();
    const unit = typeKey
      ? resolveUnit(record as ProductStockLike, typeKey)
      : null;
    const per = Math.max(1, Math.floor(unit?.qtyPerUnit || 1));
    const deductBase = q * per;
    applyProductStockDeduction(record as ProductStockLike, deductBase, typeKey);
  }
}
