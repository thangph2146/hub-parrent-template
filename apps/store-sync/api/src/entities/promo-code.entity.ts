/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

export type PromoDiscountKind = 'fixed' | 'percent';

@Entity({ tableName: 'promo_codes' })
@Index({ properties: ['code'] })
@Index({ properties: ['isActive'] })
export class PromoCode {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string;

  @Property()
  label!: string;

  @Property({ default: 'fixed' })
  discountKind: PromoDiscountKind = 'fixed';

  @Property({ default: 0 })
  discountFixed: number = 0;

  @Property({ default: 0 })
  discountPercent: number = 0;

  @Property({ nullable: true })
  discountCapVnd?: number | null;

  @Property({ default: 0 })
  minOrderSubtotal: number = 0;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  validFrom?: Date | null;

  @Property({ nullable: true })
  validUntil?: Date | null;

  @Property({ nullable: true })
  usageLimit?: number | null;

  @Property({ default: 0 })
  usageCount: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
