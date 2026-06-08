import { Entity, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

/** Metadata file trên disk — người upload thực tế (khác prefix chủ file trong tên). */
@Entity({ tableName: 'storage_files' })
export class StorageFile extends BaseEntity {
  @Property({ unique: true })
  relativePath!: string;

  @Index()
  @Property({ nullable: true })
  uploadedByUserId?: string | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
