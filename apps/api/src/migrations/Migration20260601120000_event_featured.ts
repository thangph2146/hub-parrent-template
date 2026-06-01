import { Migration } from '@mikro-orm/migrations';

/**
 * Thêm cờ sự kiện nổi bật cho storefront / landing HUB Events.
 */
export class Migration20260601120000_event_featured extends Migration {
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
    if (!(await this.columnExists('events', 'isFeatured'))) {
      this.addSql(
        'alter table `events` add `isFeatured` tinyint(1) not null default 0;',
      );
    }
    if (!(await this.columnExists('events', 'featuredOrder'))) {
      this.addSql(
        'alter table `events` add `featuredOrder` int not null default 0;',
      );
    }
  }
}
