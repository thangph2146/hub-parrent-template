import { Migration } from '@mikro-orm/migrations';

export class Migration20260624120000_drop_screens_template_id extends Migration {
  override up(): void {
    this.addSql(
      'alter table `screens` drop foreign key `screens_templateId_foreign`;',
    );
    this.addSql('alter table `screens` drop column `templateId`;');
  }

  override down(): void {
    this.addSql(
      'alter table `screens` add `templateId` int unsigned null;',
    );
    this.addSql(
      'alter table `screens` add constraint `screens_templateId_foreign` foreign key (`templateId`) references `templates` (`id`) on update cascade on delete set null;',
    );
  }
}
