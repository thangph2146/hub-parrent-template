import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'locations' })
export class Location {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text', nullable: true })
  name?: string | null;

  @Property({ type: 'text', nullable: true })
  address?: string | null;

  @Property()
  mapUrl!: string;

  @Property({ nullable: true })
  status?: number | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
