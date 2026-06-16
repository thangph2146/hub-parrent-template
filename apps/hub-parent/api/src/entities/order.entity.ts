/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import type {
  OrderGiftSnapshot,
  OrderItemSnapshot,
} from '../common/commerce/product-types';
import { User } from './user.entity';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod';
export type PaymentStatus = 'unpaid' | 'paid';

@Entity({ tableName: 'orders' })
@Index({ properties: ['orderNumber'] })
@Index({ properties: ['status'] })
@Index({ properties: ['customerEmail'] })
export class Order {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  orderNumber!: string;

  @ManyToOne(() => User, { nullable: true, fieldName: 'customerId' })
  customer?: User | null;

  @ManyToOne(() => User, { nullable: true, fieldName: 'assignedShipperId' })
  assignedShipper?: User | null;

  @Property()
  customerName!: string;

  @Property()
  customerEmail!: string;

  @Property({ nullable: true })
  customerPhone?: string | null;

  @Property({ type: 'text', nullable: true })
  shippingAddress?: string | null;

  @Property({ type: 'json' })
  items!: OrderItemSnapshot[];

  @Property({ type: 'json', nullable: true })
  gifts?: OrderGiftSnapshot[] | null;

  @Property({ default: 0 })
  subtotal: number = 0;

  @Property({ default: 0 })
  discountAmount: number = 0;

  @Property({ default: 0 })
  shippingFee: number = 0;

  @Property({ default: 0 })
  totalAmount: number = 0;

  @Property({ default: 'pending' })
  status: OrderStatus = 'pending';

  @Property({ nullable: true })
  couponCode?: string | null;

  @Property({ type: 'text', nullable: true })
  notes?: string | null;

  @Property({ default: 'cod' })
  paymentMethod: PaymentMethod = 'cod';

  @Property({ default: 'unpaid' })
  paymentStatus: PaymentStatus = 'unpaid';

  @Property({ default: false })
  isPaid: boolean = false;

  @Property({ nullable: true })
  shippedBy?: string | null;

  @Property({ nullable: true })
  shippedAt?: Date | null;

  @Property({ nullable: true })
  deliveredBy?: string | null;

  @Property({ nullable: true })
  deliveredAt?: Date | null;

  @Property({ nullable: true })
  cancelledAt?: Date | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
