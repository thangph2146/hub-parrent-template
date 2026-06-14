/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { AcademicYear } from './academic-year.entity';
import { TrainingLevel } from './training-level.entity';
import { TrainingSystem } from './training-system.entity';
import { Major } from './major.entity';

@Entity({ tableName: 'imported_users' })
export class ImportedUser {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  accountId?: string | null;

  @Property({ nullable: true })
  lastName?: string | null;

  @Property({ nullable: true })
  middleName?: string | null;

  @Property({ nullable: true })
  firstName?: string | null;

  @Property({ nullable: true })
  accountType?: string | null;

  @Property({ nullable: true })
  fullName?: string | null;

  @Property({ nullable: true })
  mobilePhone?: string | null;

  @Property({ nullable: true })
  email?: string | null;

  @Property({ nullable: true })
  homePhone1?: string | null;

  @Property({ nullable: true })
  password?: string | null;

  @Property({ nullable: true })
  homePhone?: string | null;

  @Property({ nullable: true })
  avatar?: string | null;

  @Property({ default: 1 })
  canUploadAvatar: number = 1;

  @Property({ nullable: true })
  typeId?: number | null;

  @ManyToOne(() => AcademicYear, {
    fieldName: 'academicYearId',
    nullable: true,
  })
  academicYear?: AcademicYear;

  @ManyToOne(() => TrainingLevel, {
    fieldName: 'trainingLevelId',
    nullable: true,
  })
  trainingLevel?: TrainingLevel;

  @ManyToOne(() => TrainingSystem, {
    fieldName: 'trainingSystemId',
    nullable: true,
  })
  trainingSystem?: TrainingSystem;

  @ManyToOne(() => Major, { fieldName: 'majorId', nullable: true })
  major?: Major;

  @Property({ nullable: true })
  departmentId?: number | null;

  @Property({ default: 1 })
  status: number = 1;

  @Property({ nullable: true })
  createdAt?: Date;

  @Property({ nullable: true })
  updatedAt?: Date;

  @Property({ nullable: true })
  deletedAt?: Date | null;

  @Property({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Property({ nullable: true })
  refreshTokenExp?: Date | null;
}
