import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import type { CustomerCartLine } from '../common/commerce/cart-types';

@Entity({ tableName: 'customer_carts' })
export class CustomerCart {
  @PrimaryKey()
  id!: number;

  @Property({ length: 36, unique: true })
  @Index()
  customerId!: string;

  @Property({ type: 'json' })
  lines: CustomerCartLine[] = [];

  @Property({ nullable: true })
  appliedPromoCode?: string | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
