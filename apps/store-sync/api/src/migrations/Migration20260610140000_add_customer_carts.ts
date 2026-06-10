import { Migration } from '@mikro-orm/migrations';

export class Migration20260610140000_add_customer_carts extends Migration {
  override up(): void {
    this.addSql(
      'create table `customer_carts` (`id` int unsigned not null auto_increment primary key, `customerId` varchar(36) not null, `lines` json not null, `appliedPromoCode` varchar(64) null, `createdAt` datetime not null, `updatedAt` datetime not null) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `customer_carts` add unique `customer_carts_customer_id_unique`(`customerId`);',
    );
    this.addSql(
      'alter table `customer_carts` add index `customer_carts_customer_id_index`(`customerId`);',
    );
  }

  override down(): void {
    this.addSql('drop table if exists `customer_carts`;');
  }
}
