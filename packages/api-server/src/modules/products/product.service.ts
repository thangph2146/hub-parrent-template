/**
 * Products Service.
 *
 * Bám sát pattern của `apps/main/api/src/products/products.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `product.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Product row DTO trả về cho client.
 * Các field khớp với entity `Product`.
 */
export interface ProductsRowDto extends CrudRowDto {
  id: number | string;
  sku?: string;
  name?: string;
  category?: string;
  description?: unknown;
  brand?: unknown;
  origin?: unknown;
  basePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  unit: string;
  unitTypes?: unknown[];
  images?: unknown[];
  coupons?: unknown[];
  fulfillmentNote?: unknown;
  isActive: boolean;
  deletedAt?: Date | string | null;
}

/**
 * Product create DTO - tất cả optional ngoại trừ các field required.
 */
export interface ProductsCreateData extends CrudCreateData {
  description?: unknown;
  brand?: unknown;
  origin?: unknown;
  basePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  stock?: number;
  unit?: string;
  unitTypes?: unknown[];
  images?: unknown[];
  coupons?: unknown[];
  fulfillmentNote?: unknown;
}

/**
 * Product update DTO - tất cả optional (Partial pattern).
 */
export interface ProductsUpdateData extends CrudUpdateData {
  description?: unknown;
  brand?: unknown;
  origin?: unknown;
  basePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  stock?: number;
  unit?: string;
  unitTypes?: unknown[];
  images?: unknown[];
  coupons?: unknown[];
  fulfillmentNote?: unknown;
  isActive?: boolean;
}

/**
 * Abstract Products Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseProductsService extends BaseCrudService<
  ProductsRowDto,
  ProductsCreateData,
  ProductsUpdateData
> {
  protected readonly logger = new Logger(BaseProductsService.name);

  /** Trả về class constructor của entity (vd: `Product`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Product';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /** Fields cho phép search LIKE. Override trong subclass nếu cần. */
  protected getSearchFields(): string[] {
    return ['sku', 'name', 'description', 'brand', 'origin', 'category'];
  }

  /** Fields cho phép exact-match filter. */
  protected getFilterableFields(): string[] {
    return ['category', 'isActive'];
  }

  async softDelete(id: string | number): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const found = await em.findOne(Entity, {
      [pk]: entityId,
      deletedAt: null,
    } as Record<string, unknown>);
    if (!found) return false;

    (found as Record<string, unknown>).deletedAt = new Date();
    (found as Record<string, unknown>).isActive = false;
    await em.flush();
    return true;
  }

  async restoreRow(id: string | number): Promise<ProductsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const found = await em.findOne(Entity, {
      [pk]: entityId,
    } as Record<string, unknown>);
    if (!found || !(found as Record<string, unknown>).deletedAt) return null;

    (found as Record<string, unknown>).deletedAt = null;
    (found as Record<string, unknown>).isActive = true;
    await em.flush();
    return this.mapRow(found as Record<string, unknown>);
  }
}
