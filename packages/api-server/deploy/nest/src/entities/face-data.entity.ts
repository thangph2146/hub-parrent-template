import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ tableName: 'face_data' })
export class FaceData extends BaseEntity {
  @ManyToOne(() => User, {
    nullable: true,
    deleteRule: 'cascade',
    fieldName: 'userId',
  })
  user?: User | null;

  /** personID từ HANET Face Data webhook. */
  @Property({ nullable: true, unique: true })
  hanetPersonId?: string | null;

  /** aliasID từ HANET — thường là email hoặc mã nội bộ. */
  @Property({ nullable: true })
  hanetAliasId?: string | null;

  /** personName từ HANET. */
  @Property({ nullable: true })
  displayName?: string | null;

  @Property({ type: 'text' })
  imagePath!: string;

  @Property({ default: 1 })
  status: number = 1;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ nullable: true })
  updatedAt?: Date | null;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
