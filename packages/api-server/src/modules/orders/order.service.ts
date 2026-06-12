/**
 * Orders Service.
 *
 * Bám sát pattern của `apps/main/api/src/orders/orders.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `order.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Order row DTO trả về cho client.
 * Các field khớp với entity `Order`.
 */
export interface OrdersRowDto extends CrudRowDto {
  id: number | string;
  customerName?: unknown;
  customerPhone?: unknown;
  shippingAddress?: unknown;
  gifts?: unknown[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: unknown;
  couponCode?: unknown;
  notes?: unknown;
  paymentMethod: unknown;
  paymentStatus: unknown;
  isPaid: boolean;
  shippedBy?: unknown;
  shippedAt?: Date | string | null;
  deliveredBy?: unknown;
  deliveredAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  deletedAt?: Date | string | null;
}

/**
 * Order create DTO - tất cả optional ngoại trừ các field required.
 */
export interface OrdersCreateData extends CrudCreateData {
  customerPhone?: unknown;
  shippingAddress?: unknown;
  gifts?: unknown[];
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  status?: unknown;
  couponCode?: unknown;
  notes?: unknown;
  paymentMethod?: unknown;
  paymentStatus?: unknown;
  isPaid?: boolean;
  shippedBy?: unknown;
  shippedAt?: Date | string | null;
  deliveredBy?: unknown;
  deliveredAt?: Date | string | null;
  cancelledAt?: Date | string | null;
}

/**
 * Order update DTO - tất cả optional (Partial pattern).
 */
export interface OrdersUpdateData extends CrudUpdateData {
  customerPhone?: unknown;
  shippingAddress?: unknown;
  gifts?: unknown[];
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  status?: unknown;
  couponCode?: unknown;
  notes?: unknown;
  paymentMethod?: unknown;
  paymentStatus?: unknown;
  isPaid?: boolean;
  shippedBy?: unknown;
  shippedAt?: Date | string | null;
  deliveredBy?: unknown;
  deliveredAt?: Date | string | null;
  cancelledAt?: Date | string | null;
}

export interface StaffOrderStatusCounts {
  ALL: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

/**
 * Abstract Orders Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseOrdersService extends BaseCrudService<
  OrdersRowDto,
  OrdersCreateData,
  OrdersUpdateData
> {
  protected readonly logger = new Logger(BaseOrdersService.name);

  /** Trả về class constructor của entity (vd: `Order`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Order';
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
    return ['customerName', 'customerPhone', 'shippingAddress', 'couponCode'];
  }

  /** Fields cho phép exact-match filter. */
  protected getFilterableFields(): string[] {
    return ['status', 'paymentStatus', 'isPaid'];
  }

  async getStaffStatusCounts(): Promise<StaffOrderStatusCounts> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
    const baseWhere = {
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>;

    const counts = await Promise.all(
      statuses.map((status) =>
        em.count(Entity, {
          ...baseWhere,
          status,
        } as FilterQuery<Record<string, unknown>>),
      ),
    );

    return {
      ALL: counts.reduce((sum, value) => sum + value, 0),
      pending: counts[0],
      confirmed: counts[1],
      shipped: counts[2],
      delivered: counts[3],
      cancelled: counts[4],
    };
  }

  async updateStatus(
    id: string | number,
    status: OrdersRowDto['status'],
  ): Promise<OrdersRowDto | null> {
    return this.update(id, {
      status,
    } as OrdersUpdateData);
  }
}
