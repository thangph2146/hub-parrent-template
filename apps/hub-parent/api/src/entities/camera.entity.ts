import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Event } from './event.entity';

@Entity({ tableName: 'cameras' })
export class Camera extends BaseEntity {
  @Property()
  name!: string;

  /** Mã thiết bị HANET (`deviceID` trong webhook). */
  @Property({ nullable: true })
  code?: string | null;

  /** Sự kiện nhận webhook khi URL không có `{eventId}` (một webhook chung cho camera). */
  @ManyToOne(() => Event, {
    nullable: true,
    fieldName: 'linkedEventId',
    deleteRule: 'set null',
  })
  linkedEvent?: Event | null;

  @Property({ nullable: true })
  ipAddress?: string | null;

  @Property({ nullable: true })
  port?: number | null;

  @Property({ nullable: true })
  username?: string | null;

  @Property({ nullable: true, hidden: true })
  password?: string | null;

  @Property({ default: 1 })
  status: number = 1;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
