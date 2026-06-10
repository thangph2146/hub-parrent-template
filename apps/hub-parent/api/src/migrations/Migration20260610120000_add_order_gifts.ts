import { Migration } from '@mikro-orm/migrations';

export class Migration20260610120000_add_order_gifts extends Migration {
  override up(): void {
    this.addSql('alter table `orders` add `gifts` json null after `items`;');
  }

  override down(): void {
    this.addSql('alter table `orders` drop column `gifts`;');
  }
}
