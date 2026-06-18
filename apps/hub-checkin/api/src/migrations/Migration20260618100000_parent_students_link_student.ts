/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260618100000_parent_students_link_student extends Migration {
  override up(): void {
    this.addSql(
      'alter table `parent_students` add `studentId` int unsigned null;',
    );
    this.addSql(
      "update `parent_students` set `studentCode` = concat('parent-student-', `id`) where `studentCode` is null or trim(`studentCode`) = '';",
    );
    this.addSql(
      "insert into `students` (`name`, `email`, `studentCode`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`) select min(nullif(trim(ps.`studentName`), '')), null, trim(ps.`studentCode`), 1, now(), now(), null from `parent_students` ps left join `students` s on s.`studentCode` = trim(ps.`studentCode`) where ps.`studentCode` is not null and trim(ps.`studentCode`) <> '' and s.`id` is null group by trim(ps.`studentCode`);",
    );
    this.addSql(
      'update `parent_students` ps inner join `students` s on s.`studentCode` = trim(ps.`studentCode`) set ps.`studentId` = s.`id` where ps.`studentId` is null;',
    );
    this.addSql(
      'alter table `parent_students` modify `studentId` int unsigned not null;',
    );
    this.addSql(
      'alter table `parent_students` add unique `parent_students_parentId_studentId_unique`(`parentId`, `studentId`);',
    );
    this.addSql(
      'alter table `parent_students` add index `parent_students_studentId_index`(`studentId`);',
    );
    this.addSql(
      'alter table `parent_students` add constraint `parent_students_studentId_foreign` foreign key (`studentId`) references `students` (`id`) on update cascade on delete cascade;',
    );
  }

  override down(): void {
    this.addSql(
      'alter table `parent_students` drop foreign key `parent_students_studentId_foreign`;',
    );
    this.addSql(
      'alter table `parent_students` drop index `parent_students_parentId_studentId_unique`;',
    );
    this.addSql(
      'alter table `parent_students` drop index `parent_students_studentId_index`;',
    );
    this.addSql('alter table `parent_students` drop column `studentId`;');
  }
}
