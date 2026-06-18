/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260609120000_add_products_orders extends Migration {
  override up(): void {
    this.addSql(
      "create table `products` (`id` int unsigned not null auto_increment primary key, `sku` varchar(255) not null, `name` varchar(255) not null, `description` text null, `category` varchar(255) not null, `brand` varchar(255) null, `origin` varchar(255) null, `basePrice` int not null default 0, `wholesalePrice` int not null default 0, `retailPrice` int not null default 0, `stock` int not null default 0, `unit` varchar(64) not null default 'cai', `unitTypes` json null, `images` json null, `coupons` json null, `fulfillmentNote` text null, `isActive` tinyint(1) not null default 1, `createdAt` datetime not null, `updatedAt` datetime not null, `deletedAt` datetime null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `products` add unique `products_sku_unique`(`sku`);',
    );
    this.addSql(
      'alter table `products` add index `products_category_index`(`category`);',
    );
    this.addSql(
      'alter table `products` add index `products_is_active_index`(`isActive`);',
    );

    this.addSql(
      "create table `orders` (`id` int unsigned not null auto_increment primary key, `orderNumber` varchar(64) not null, `customerId` varchar(36) null, `assignedShipperId` varchar(36) null, `customerName` varchar(255) not null, `customerEmail` varchar(255) not null, `customerPhone` varchar(64) null, `shippingAddress` text null, `items` json not null, `subtotal` int not null default 0, `discountAmount` int not null default 0, `shippingFee` int not null default 0, `totalAmount` int not null default 0, `status` varchar(32) not null default 'pending', `couponCode` varchar(64) null, `notes` text null, `paymentMethod` varchar(16) not null default 'cod', `paymentStatus` varchar(16) not null default 'unpaid', `isPaid` tinyint(1) not null default 0, `shippedBy` varchar(36) null, `shippedAt` datetime null, `deliveredBy` varchar(36) null, `deliveredAt` datetime null, `cancelledAt` datetime null, `createdAt` datetime not null, `updatedAt` datetime not null, `deletedAt` datetime null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'alter table `orders` add unique `orders_order_number_unique`(`orderNumber`);',
    );
    this.addSql(
      'alter table `orders` add index `orders_status_index`(`status`);',
    );
    this.addSql(
      'alter table `orders` add index `orders_customer_email_index`(`customerEmail`);',
    );
    this.addSql(
      'alter table `orders` add index `orders_customer_id_index`(`customerId`);',
    );
    this.addSql(
      'alter table `orders` add index `orders_assigned_shipper_id_index`(`assignedShipperId`);',
    );
  }

  override down(): void {
    this.addSql('drop table if exists `orders`;');
    this.addSql('drop table if exists `products`;');
  }
}
