import { Migration } from '@mikro-orm/migrations';

export class Migration20260611120000_add_promo_codes extends Migration {
  override up(): void {
    this.addSql(
      "create table `promo_codes` (`id` int unsigned not null auto_increment primary key, `code` varchar(64) not null, `label` varchar(255) not null, `discountKind` varchar(16) not null default 'fixed', `discountFixed` int not null default 0, `discountPercent` int not null default 0, `discountCapVnd` int null, `minOrderSubtotal` int not null default 0, `isActive` tinyint(1) not null default 1, `validFrom` datetime null, `validUntil` datetime null, `usageLimit` int null, `usageCount` int not null default 0, `createdAt` datetime not null, `updatedAt` datetime not null, `deletedAt` datetime null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `promo_codes` add unique `promo_codes_code_unique`(`code`);',
    );
    this.addSql(
      'alter table `promo_codes` add index `promo_codes_is_active_index`(`isActive`);',
    );
  }

  override down(): void {
    this.addSql('drop table if exists `promo_codes`;');
  }
}
