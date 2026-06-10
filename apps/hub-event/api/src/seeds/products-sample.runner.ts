import type { EntityManager } from '@mikro-orm/core';
import { Product } from '../entities/product.entity';
import { STORESYNC_SAMPLE_PRODUCTS } from './storesync-sample.data';

/** Seed sản phẩm mẫu StoreSync nếu chưa có SKU tương ứng. */
export async function seedSampleProducts(em: EntityManager): Promise<number> {
  let created = 0;
  const now = new Date();
  for (const sample of STORESYNC_SAMPLE_PRODUCTS) {
    const sku = sample.sku?.trim();
    if (!sku) continue;
    const exists = await em.findOne(Product, { sku });
    if (exists) continue;
    em.persist(
      em.create(Product, {
        ...sample,
        sku,
        name: sample.name ?? sku,
        category: sample.category ?? 'general',
        basePrice: sample.retailPrice ?? 0,
        wholesalePrice: sample.wholesalePrice ?? 0,
        retailPrice: sample.retailPrice ?? 0,
        stock: sample.stock ?? 0,
        unit: sample.unit ?? 'cai',
        isActive: sample.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      }),
    );
    created += 1;
  }
  if (created) await em.flush();
  return created;
}
