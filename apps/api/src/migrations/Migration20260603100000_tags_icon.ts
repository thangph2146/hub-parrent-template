import { Migration } from '@mikro-orm/migrations';

export class Migration20260603100000_tags_icon extends Migration {
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
    if (!(await this.columnExists('tags', 'icon'))) {
      this.addSql(
        'alter table `tags` add `icon` varchar(255) null default null;',
      );
    }
  }
}
