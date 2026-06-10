import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'courses' })
export class Course {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true })
  startYear?: number | null;

  @Property({ nullable: true })
  endYear?: number | null;

  @Property({ nullable: true })
  departmentId?: number | null;

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
