import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import type { ProductUnitType } from '../common/product-types';

@Entity({ tableName: 'products' })
@Index({ properties: ['sku'] })
@Index({ properties: ['category'] })
@Index({ properties: ['isActive'] })
export class Product {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  sku!: string;

  @Property()
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string | null;

  @Property()
  category!: string;

  @Property({ nullable: true })
  brand?: string | null;

  @Property({ nullable: true })
  origin?: string | null;

  @Property({ default: 0 })
  basePrice: number = 0;

  @Property({ default: 0 })
  wholesalePrice: number = 0;

  @Property({ default: 0 })
  retailPrice: number = 0;

  @Property({ default: 0 })
  stock: number = 0;

  @Property({ default: 'cai' })
  unit: string = 'cai';

  @Property({ type: 'json', nullable: true })
  unitTypes?: ProductUnitType[] | null;

  @Property({ type: 'json', nullable: true })
  images?: string[] | null;

  @Property({ type: 'json', nullable: true })
  coupons?: string[] | null;

  @Property({ type: 'text', nullable: true })
  fulfillmentNote?: string | null;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
