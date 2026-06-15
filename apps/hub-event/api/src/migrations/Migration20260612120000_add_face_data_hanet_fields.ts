/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260612120000_add_face_data_hanet_fields extends Migration {
  override up(): void {
    this.addSql(
      'alter table `face_data` add `hanetPersonId` varchar(64) null, add `hanetAliasId` varchar(255) null, add `displayName` varchar(255) null;',
    );
    this.addSql(
      'alter table `face_data` add unique `face_data_hanet_person_id_unique`(`hanetPersonId`);',
    );
    this.addSql(
      'alter table `face_data` add index `face_data_hanet_person_id_index`(`hanetPersonId`);',
    );
  }

  override down(): void {
    this.addSql(
      'alter table `face_data` drop index `face_data_hanet_person_id_index`;',
    );
    this.addSql(
      'alter table `face_data` drop index `face_data_hanet_person_id_unique`;',
    );
    this.addSql(
      'alter table `face_data` drop column `hanetPersonId`, drop column `hanetAliasId`, drop column `displayName`;',
    );
  }
}
