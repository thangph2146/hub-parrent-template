import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

export type ParentStudentStatus = 'pending' | 'approved' | 'rejected';

/**
 * Liên kết phụ huynh (User có role parent) với học sinh qua bảng nối chuẩn.
 * Khi phụ huynh thêm con, status = 'pending', quản trị viên duyệt → 'approved'.
 * studentCode/studentName là snapshot để giữ tương thích API điểm ngoài.
 */
@Entity({ tableName: 'parent_students' })
@Unique({ properties: ['parent', 'student'] })
export class ParentStudent extends BaseEntity {
  @ManyToOne(() => User, {
    deleteRule: 'cascade',
    fieldName: 'parentId',
  })
  parent!: User;

  @ManyToOne(() => Student, {
    deleteRule: 'cascade',
    fieldName: 'studentId',
  })
  student!: Student;

  @Property()
  studentCode!: string;

  @Property({ nullable: true })
  studentName?: string | null;

  @Property({ nullable: true })
  note?: string | null;

  @Property({ default: 'pending' })
  status: ParentStudentStatus = 'pending';

  @Property({ nullable: true })
  reviewedBy?: string | null;

  @Property({ nullable: true })
  reviewedAt?: Date | null;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;
}
