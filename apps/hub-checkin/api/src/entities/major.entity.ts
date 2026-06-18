/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'majors' })
export class Major {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  code!: string;

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
