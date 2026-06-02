import { Migration } from '@mikro-orm/migrations';

/** Khung giờ check-out (tương ứng thoi_gian_checkout_* trên hệ cũ). */
export class Migration20260602140000_event_checkout_window extends Migration {
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
    if (!(await this.columnExists('events', 'checkoutStart'))) {
      this.addSql(
        'alter table `events` add `checkoutStart` datetime null;',
      );
    }
    if (!(await this.columnExists('events', 'checkoutEnd'))) {
      this.addSql('alter table `events` add `checkoutEnd` datetime null;');
    }
  }
}
