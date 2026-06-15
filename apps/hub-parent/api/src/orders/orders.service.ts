/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { ProductsService } from '../products/products.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { UploadsService } from '../uploads/uploads.service';
import {
  BaseOrdersService,
  type OrdersProductsPort,
  type OrdersPromoPort,
  type OrdersUploadsPort,
} from '../common/module-bases/orders/order.service';

export type {
  OrderRowDto,
  CreateOrderDto,
  OrderStatus,
  StaffOrderStatusCounts,
} from '../common/module-bases/orders/order.service';

export type { CreateOrderLineInput } from '../common/module-bases/orders/order-checkout';

export {
  mergeCreateOrderLines,
  buildOrderItemsFromProducts,
  buildOrderNumber,
} from '../common/module-bases/orders/order-checkout';

@Injectable()
export class OrdersService extends BaseOrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly productsService: ProductsService,
    private readonly promoCodesService: PromoCodesService,
    private readonly uploadsService: UploadsService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getOrderEntity() {
    return Order as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getProductsPort(): OrdersProductsPort {
    return this.productsService;
  }

  protected getPromoPort(): OrdersPromoPort {
    return {
      findRedeemableByCode: async (code) => {
        const row = await this.promoCodesService.findRedeemableByCode(code);
        if (!row) return null;
        return {
          id: row.id,
          code: row.code,
          label: row.label,
          discountKind: row.discountKind,
          discountFixed: row.discountFixed,
          discountPercent: row.discountPercent,
          discountCapVnd: row.discountCapVnd ?? null,
          minOrderSubtotal: row.minOrderSubtotal,
        };
      },
      incrementUsage: (txEm, id) =>
        this.promoCodesService.incrementUsage(txEm, id),
    };
  }

  protected getUploadsPort(): OrdersUploadsPort {
    return this.uploadsService;
  }
}
