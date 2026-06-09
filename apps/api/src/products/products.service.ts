import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Product } from '../entities/product.entity';
import type { ProductUnitType } from '../common/product-types';
import {
  deductBaseStockFromUnits,
  productBaseStock,
  resolveUnit,
  sumUnitStocks,
} from '../common/product-units';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/pagination';

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

function toIso(value: Date | undefined | null): string {
  if (!value) return new Date().toISOString();
  return value.toISOString();
}

function syncProductStockFromUnits(row: Product): void {
  const units = row.unitTypes ?? [];
  const hasUnitStock = units.some(
    (u) => u.stock !== undefined && u.stock !== null,
  );
  if (hasUnitStock) {
    row.stock = sumUnitStocks(row);
  }
}

function mapProduct(row: Product): ProductRowDto {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description ?? null,
    category: row.category,
    brand: row.brand ?? null,
    origin: row.origin ?? null,
    basePrice: row.basePrice,
    wholesalePrice: row.wholesalePrice,
    retailPrice: row.retailPrice,
    stock: row.stock,
    unit: row.unit,
    unitTypes: row.unitTypes ?? null,
    images: row.images ?? null,
    coupons: row.coupons ?? null,
    fulfillmentNote: row.fulfillmentNote ?? null,
    isActive: row.isActive,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    deletedAt: row.deletedAt ? toIso(row.deletedAt) : null,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly em: EntityManager) {}

  async list(params: {
    page: number;
    limit: number;
    activeOnly?: boolean;
    category?: string;
    q?: string;
    trash?: boolean;
  }): Promise<{
    data: ProductRowDto[];
    pagination: ReturnType<typeof paginationMeta>;
  }> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: FilterQuery<Product> = {};
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

    const [rows, total] = await this.em.findAndCount(Product, where, {
      orderBy: { updatedAt: 'DESC' },
      limit,
      offset: skip,
    });
    return {
      data: rows.map(mapProduct),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: number): Promise<ProductRowDto | null> {
    const row = await this.em.findOne(Product, { id, deletedAt: null });
    return row ? mapProduct(row) : null;
  }

  async getBySku(sku: string): Promise<ProductRowDto | null> {
    const normalized = sku.trim();
    if (!normalized) return null;
    const row = await this.em.findOne(Product, {
      sku: normalized,
      deletedAt: null,
      isActive: true,
    });
    return row ? mapProduct(row) : null;
  }

  async getPublicById(id: number): Promise<ProductRowDto | null> {
    const row = await this.em.findOne(Product, {
      id,
      deletedAt: null,
      isActive: true,
    });
    return row ? mapProduct(row) : null;
  }

  async findActiveByIds(ids: number[]): Promise<Product[]> {
    const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
    if (!unique.length) return [];
    return this.em.find(Product, {
      id: { $in: unique },
      deletedAt: null,
      isActive: true,
    });
  }

  async create(data: Partial<Product>): Promise<ProductRowDto> {
    const now = new Date();
    const row = this.em.create(Product, {
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
    });
    syncProductStockFromUnits(row);
    await this.em.persistAndFlush(row);
    return mapProduct(row);
  }

  async update(
    id: number,
    data: Partial<Product>,
  ): Promise<ProductRowDto | null> {
    const row = await this.em.findOne(Product, { id, deletedAt: null });
    if (!row) return null;
    if (data.sku !== undefined) row.sku = String(data.sku).trim();
    if (data.name !== undefined) row.name = String(data.name).trim();
    if (data.description !== undefined) row.description = data.description;
    if (data.category !== undefined)
      row.category = String(data.category).trim();
    if (data.brand !== undefined) row.brand = data.brand;
    if (data.origin !== undefined) row.origin = data.origin;
    if (data.basePrice !== undefined)
      row.basePrice = Number(data.basePrice) || 0;
    if (data.wholesalePrice !== undefined) {
      row.wholesalePrice = Number(data.wholesalePrice) || 0;
    }
    if (data.retailPrice !== undefined) {
      row.retailPrice = Number(data.retailPrice) || 0;
    }
    if (data.stock !== undefined) {
      row.stock = Math.max(0, Math.floor(Number(data.stock) || 0));
    }
    if (data.unit !== undefined) row.unit = String(data.unit).trim() || 'cai';
    if (data.unitTypes !== undefined) {
      row.unitTypes = data.unitTypes;
      syncProductStockFromUnits(row);
    }
    if (data.images !== undefined) row.images = data.images;
    if (data.coupons !== undefined) row.coupons = data.coupons;
    if (data.fulfillmentNote !== undefined) {
      row.fulfillmentNote = data.fulfillmentNote;
    }
    if (data.isActive !== undefined) row.isActive = Boolean(data.isActive);
    await this.em.flush();
    return mapProduct(row);
  }

  async softDelete(id: number): Promise<boolean> {
    const row = await this.em.findOne(Product, { id, deletedAt: null });
    if (!row) return false;
    row.deletedAt = new Date();
    row.isActive = false;
    await this.em.flush();
    return true;
  }

  async restore(id: number): Promise<ProductRowDto | null> {
    const row = await this.em.findOne(Product, { id });
    if (!row?.deletedAt) return null;
    row.deletedAt = null;
    row.isActive = true;
    await this.em.flush();
    return mapProduct(row);
  }

  /** Giảm tồn kho sau checkout — trừ sp gốc từ pool chung các loại hàng. */
  async decrementStock(
    em: EntityManager,
    productId: number,
    quantity: number,
    unitType?: string,
  ): Promise<void> {
    const row = await em.findOne(Product, { id: productId, deletedAt: null });
    if (!row) throw new Error(`Sản phẩm #${productId} không tồn tại`);
    const q = Math.max(1, Math.floor(quantity));
    const typeKey = unitType?.trim();
    const unit = typeKey ? resolveUnit(row, typeKey) : null;
    const per = Math.max(1, Math.floor(unit?.qtyPerUnit || 1));
    const deductBase = q * per;
    const base = productBaseStock(row);

    if (base < deductBase) {
      const label = unit?.label ?? row.unit;
      throw new Error(`Loại "${label}" của "${row.name}" không đủ tồn kho`);
    }

    if (row.unitTypes?.length) {
      deductBaseStockFromUnits(row, deductBase, typeKey);
      syncProductStockFromUnits(row);
      return;
    }

    row.stock = Math.max(0, base - deductBase);
  }
}
