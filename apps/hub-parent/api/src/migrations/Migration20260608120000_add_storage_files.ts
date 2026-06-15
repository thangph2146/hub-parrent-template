import { Migration } from '@mikro-orm/migrations';

/** Bảng metadata upload — lưu người upload thực tế, không suy từ tên file. */
export class Migration20260608120000_add_storage_files extends Migration {
  override up(): void {
    this.addSql(
      'create table `storage_files` (`id` varchar(36) not null, `relativePath` varchar(512) not null, `uploadedByUserId` varchar(36) null, `createdAt` datetime not null, `updatedAt` datetime not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `storage_files` add unique `storage_files_relative_path_unique`(`relativePath`);',
    );
    this.addSql(
      'alter table `storage_files` add index `storage_files_uploaded_by_user_id_index`(`uploadedByUserId`);',
    );
  }

  override down(): void {
    this.addSql('drop table if exists `storage_files`;');
  }
}
