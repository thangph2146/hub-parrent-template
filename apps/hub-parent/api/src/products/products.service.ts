/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Product } from '../entities/product.entity';
import { BaseProductsService } from '../common/module-bases/products/product.service';
import { toEntityIdList } from '../common/entity-id';

export type {
  ProductRowDto,
  ProductListParams,
  ProductListResult,
  ProductWriteData,
} from '../common/module-bases/products/product.service';

@Injectable()
export class ProductsService extends BaseProductsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Product as unknown as new () => Record<string, unknown>;
  }

  /** Orders/checkout cần entity `Product`, không phải DTO. */
  override async findActiveByIds(ids: number[]): Promise<Product[]> {
    const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
    if (!unique.length) return [];
    return this.em.find(Product, {
      id: { $in: toEntityIdList(unique) },
      deletedAt: null,
      isActive: true,
    });
  }

  override async findActiveByIdsForUpdate(
    em: EntityManager,
    ids: number[],
  ): Promise<Product[]> {
    const rows = await super.findActiveByIdsForUpdate(em, ids);
    return rows as unknown as Product[];
  }
}
