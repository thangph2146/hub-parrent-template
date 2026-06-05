import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'academic_years' })
export class AcademicYear {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'date', nullable: true })
  startDate?: string | null;

  @Property({ type: 'date', nullable: true })
  endDate?: string | null;

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
