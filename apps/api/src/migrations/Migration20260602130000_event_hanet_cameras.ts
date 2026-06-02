import { Migration } from '@mikro-orm/migrations';

/** Camera check-in / check-out gắn với sự kiện. */
export class Migration20260602130000_event_hanet_cameras extends Migration {
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
    if (!(await this.columnExists('events', 'checkinCameraId'))) {
      this.addSql(
        'alter table `events` add `checkinCameraId` varchar(36) null;',
      );
      this.addSql(
        'alter table `events` add constraint `events_checkinCameraId_foreign` foreign key (`checkinCameraId`) references `cameras` (`id`) on update cascade on delete set null;',
      );
    }
    if (!(await this.columnExists('events', 'checkoutCameraId'))) {
      this.addSql(
        'alter table `events` add `checkoutCameraId` varchar(36) null;',
      );
      this.addSql(
        'alter table `events` add constraint `events_checkoutCameraId_foreign` foreign key (`checkoutCameraId`) references `cameras` (`id`) on update cascade on delete set null;',
      );
    }
  }
}
