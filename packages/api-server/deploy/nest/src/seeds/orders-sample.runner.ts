import type { EntityManager } from '@mikro-orm/core';
import { evaluateOrderGifts } from '../common/commerce/gift-rules';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import {
  buildOrderItemsFromProducts,
  type CreateOrderLineInput,
} from '../common/module-bases/orders/order-checkout';
import { STORESYNC_SAMPLE_ORDERS } from './storesync-sample.data';

/** Seed đơn hàng mẫu StoreSync nếu chưa có orderNumber tương ứng. */
export async function seedSampleOrders(em: EntityManager): Promise<number> {
  let created = 0;
  const now = new Date();

  const products = await em.find(Product, { deletedAt: null });
  const bySku = new Map(products.map((p) => [p.sku.trim(), p]));

  for (const sample of STORESYNC_SAMPLE_ORDERS) {
    const orderNumber = sample.orderNumber.trim();
    if (!orderNumber) continue;
    const exists = await em.findOne(Order, { orderNumber });
    if (exists) continue;

    const mergedLines: CreateOrderLineInput[] = [];
    for (const line of sample.lines) {
      const product = bySku.get(line.productSku.trim());
      if (!product?.id) {
        continue;
      }
      mergedLines.push({
        productId: product.id,
        unitType: line.unitType,
        quantity: line.quantity,
      });
    }
    if (!mergedLines.length) continue;

    const productsById = new Map(products.map((p) => [p.id, p]));
    const items = buildOrderItemsFromProducts(mergedLines, productsById);
    const subtotal = items.reduce((sum, row) => sum + row.totalPrice, 0);
    const discountAmount = Math.max(0, Math.floor(sample.discountAmount ?? 0));
    const shippingFee = Math.max(0, Math.floor(sample.shippingFee ?? 0));
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const gifts = evaluateOrderGifts(
      mergedLines.map((l) => ({
        productId: l.productId,
        unitType: l.unitType,
        quantity: l.quantity,
      })),
      productsById,
    );

    const customer = await em.findOne(User, {
      email: sample.customerEmail.trim(),
    });

    em.persist(
      em.create(Order, {
        orderNumber,
        customer: customer ?? null,
        customerName: sample.customerName,
        customerEmail: sample.customerEmail,
        customerPhone: sample.customerPhone ?? null,
        shippingAddress: sample.shippingAddress ?? null,
        items,
        gifts: gifts.length ? gifts : null,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        status: sample.status,
        couponCode: sample.couponCode?.trim() || null,
        notes: sample.notes ?? null,
        paymentMethod: 'cod',
        paymentStatus: sample.paymentStatus ?? 'unpaid',
        isPaid: sample.isPaid ?? false,
        shippedAt: sample.shippedAt ?? null,
        deliveredAt: sample.deliveredAt ?? null,
        createdAt: now,
        updatedAt: now,
      }),
    );
    created += 1;
  }

  if (created) await em.flush();
  return created;
}
