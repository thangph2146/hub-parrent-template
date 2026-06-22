/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/** Metadata file trên disk — người upload thực tế (khác prefix chủ file trong tên). */
@Entity({ tableName: 'storage_files' })
export class StorageFile extends BaseEntity {
  @Property({ unique: true })
  relativePath!: string;

  @ManyToOne(() => User, { nullable: true, fieldName: 'uploadedByUserId' })
  uploadedBy?: User | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
