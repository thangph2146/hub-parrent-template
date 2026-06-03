import { Migration } from '@mikro-orm/migrations';

export class Migration20260602150000_categories_icon_sort_order extends Migration {
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
    if (!(await this.columnExists('categories', 'icon'))) {
      this.addSql(
        'alter table `categories` add `icon` varchar(255) null default null;',
      );
    }
    if (!(await this.columnExists('categories', 'sortOrder'))) {
      this.addSql(
        'alter table `categories` add `sortOrder` int not null default 0;',
      );
    }
  }
}
