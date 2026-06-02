import { Migration } from '@mikro-orm/migrations';

/** Gắn camera HANET với sự kiện (deviceID → linkedEventId). */
export class Migration20260602120000_camera_linked_event extends Migration {
  private async columnExists(
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const rows = (await this.execute(
      `select 1 as ok from information_schema.columns
       where table_schema = database() and table_name = ? and column_name = ? limit 1`,
      [tableName, columnName],
    )) as Array<{ ok?: number }>;
    return rows.length > 0;
  }

  async up(): Promise<void> {
    if (!(await this.columnExists('cameras', 'linkedEventId'))) {
      this.addSql(
        'alter table `cameras` add `linkedEventId` varchar(36) null;',
      );
      this.addSql(
        'alter table `cameras` add constraint `cameras_linkedEventId_foreign` foreign key (`linkedEventId`) references `events` (`id`) on update cascade on delete set null;',
      );
    }
  }
}
