/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'speakers' })
export class Speaker {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true })
  title?: string | null;

  @Property({ nullable: true })
  organization?: string | null;

  @Property({ type: 'text', nullable: true })
  bio?: string | null;

  @Property({ nullable: true })
  avatar?: string | null;

  @Property({ nullable: true })
  email?: string | null;

  @Property({ nullable: true })
  phone?: string | null;

  @Property({ default: 1 })
  status: number = 1;

  @Property({ nullable: true, onCreate: () => new Date() })
  createdAt?: Date;

  @Property({
    nullable: true,
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  updatedAt?: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
