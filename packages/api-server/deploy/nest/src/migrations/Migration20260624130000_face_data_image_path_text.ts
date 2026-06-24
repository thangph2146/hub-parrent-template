import { Migration } from '@mikro-orm/migrations';

/** Avatar HANET thường là signed URL dài — varchar(255) gây ER_DATA_TOO_LONG khi sync. */
export class Migration20260624130000_face_data_image_path_text extends Migration {
  override up(): void {
    this.addSql(
      'alter table `face_data` modify `imagePath` text not null;',
    );
    this.addSql(
      'alter table `face_data` modify `hanetPersonId` varchar(255) null;',
    );
  }

  override down(): void {
    this.addSql(
      'alter table `face_data` modify `imagePath` varchar(255) not null;',
    );
    this.addSql(
      'alter table `face_data` modify `hanetPersonId` varchar(64) null;',
    );
  }
}
