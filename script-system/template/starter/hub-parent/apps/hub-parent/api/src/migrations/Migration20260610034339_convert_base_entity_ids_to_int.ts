/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260610034339_convert_base_entity_ids_to_int extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`categories\` drop foreign key \`categories_parentId_foreign\`;`,
    );

    this.addSql(
      `alter table \`students\` drop foreign key \`students_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`sessions\` drop foreign key \`sessions_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`posts\` drop foreign key \`posts_authorId_foreign\`;`,
    );

    this.addSql(
      `alter table \`post_tags\` drop foreign key \`post_tags_postId_foreign\`;`,
    );
    this.addSql(
      `alter table \`post_tags\` drop foreign key \`post_tags_tagId_foreign\`;`,
    );

    this.addSql(
      `alter table \`post_categories\` drop foreign key \`post_categories_categoryId_foreign\`;`,
    );
    this.addSql(
      `alter table \`post_categories\` drop foreign key \`post_categories_postId_foreign\`;`,
    );

    this.addSql(
      `alter table \`parent_students\` drop foreign key \`parent_students_parentId_foreign\`;`,
    );

    this.addSql(
      `alter table \`notifications\` drop foreign key \`notifications_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`groups\` drop foreign key \`groups_createdById_foreign\`;`,
    );

    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_groupId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_parentId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_receiverId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_senderId_foreign\`;`,
    );

    this.addSql(
      `alter table \`message_reads\` drop foreign key \`message_reads_messageId_foreign\`;`,
    );
    this.addSql(
      `alter table \`message_reads\` drop foreign key \`message_reads_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`group_members\` drop foreign key \`group_members_groupId_foreign\`;`,
    );
    this.addSql(
      `alter table \`group_members\` drop foreign key \`group_members_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`face_data\` drop foreign key \`face_data_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`events\` drop foreign key \`events_checkinCameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`events\` drop foreign key \`events_checkoutCameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`events\` drop foreign key \`events_createdById_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_speakers\` drop foreign key \`event_speakers_eventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_registrations\` drop foreign key \`event_registrations_eventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_checkins\` drop foreign key \`event_checkins_eventId_foreign\`;`,
    );
    this.addSql(
      `alter table \`event_checkins\` drop foreign key \`event_checkins_registrationId_foreign\`;`,
    );

    this.addSql(
      `alter table \`cameras\` drop foreign key \`cameras_linkedEventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`screens\` drop foreign key \`screens_cameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`screens\` drop foreign key \`screens_templateId_foreign\`;`,
    );

    this.addSql(
      `alter table \`contact_requests\` drop foreign key \`contact_requests_assignedToId_foreign\`;`,
    );
    this.addSql(
      `alter table \`contact_requests\` drop foreign key \`contact_requests_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`comments\` drop foreign key \`comments_authorId_foreign\`;`,
    );
    this.addSql(
      `alter table \`comments\` drop foreign key \`comments_postId_foreign\`;`,
    );

    this.addSql(
      `alter table \`accounts\` drop foreign key \`accounts_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`user_roles\` drop foreign key \`user_roles_roleId_foreign\`;`,
    );
    this.addSql(
      `alter table \`user_roles\` drop foreign key \`user_roles_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`academic_years\` modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`admission_results\` modify \`id\` int unsigned not null auto_increment, modify \`cccd\` varchar(255), modify \`soBaoDanh\` varchar(255), modify \`diemMon1\` varchar(255), modify \`diemMon2\` varchar(255), modify \`diemMon3\` varchar(255), modify \`diemTong\` varchar(255), modify \`diemUuTienKhuVuc\` varchar(255), modify \`diemUuTienDoiTuong\` varchar(255), modify \`ghiChu\` text, modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`categories\` modify \`id\` int unsigned not null auto_increment, modify \`description\` text, modify \`type\` varchar(255) not null default 'post', modify \`icon\` varchar(255), modify \`deletedAt\` varchar(255), modify \`parentId\` int unsigned;`,
    );
    this.addSql(
      `alter table \`categories\` add constraint \`categories_parentId_foreign\` foreign key (\`parentId\`) references \`categories\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`courses\` modify \`startYear\` varchar(255), modify \`endYear\` varchar(255), modify \`departmentId\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(`alter table \`customer_carts\` drop constraint lines;`);

    this.addSql(
      `alter table \`customer_carts\` modify \`lines\` json not null, modify \`appliedPromoCode\` varchar(255);`,
    );
    this.addSql(
      `alter table \`customer_carts\` rename index \`customer_carts_customer_id_index\` to \`customer_carts_customerId_index\`;`,
    );
    this.addSql(
      `alter table \`customer_carts\` drop index \`customer_carts_customer_id_unique\`;`,
    );
    this.addSql(
      `alter table \`customer_carts\` add unique \`customer_carts_customerId_unique\`(\`customerId\`);`,
    );

    this.addSql(
      `alter table \`departments\` modify \`id\` int unsigned not null auto_increment, modify \`description\` text, modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`locations\` modify \`name\` text, modify \`address\` text, modify \`status\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(`alter table \`majors\` modify \`deletedAt\` varchar(255);`);

    this.addSql(`alter table \`page_contents\` drop constraint content;`);

    this.addSql(
      `alter table \`page_contents\` modify \`id\` int unsigned not null auto_increment, modify \`content\` json not null;`,
    );

    this.addSql(`alter table \`products\` drop constraint coupons;`);
    this.addSql(`alter table \`products\` drop constraint images;`);
    this.addSql(`alter table \`products\` drop constraint unitTypes;`);

    this.addSql(
      `alter table \`products\` modify \`description\` text, modify \`brand\` varchar(255), modify \`origin\` varchar(255), modify \`unit\` varchar(255) not null default 'cai', modify \`unitTypes\` json, modify \`images\` json, modify \`coupons\` json, modify \`fulfillmentNote\` text, modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`products\` add index \`products_sku_index\`(\`sku\`);`,
    );
    this.addSql(
      `alter table \`products\` rename index \`products_is_active_index\` to \`products_isActive_index\`;`,
    );

    this.addSql(
      `alter table \`promo_codes\` modify \`code\` varchar(255) not null, modify \`discountKind\` varchar(255) not null default 'fixed', modify \`discountCapVnd\` varchar(255), modify \`validFrom\` varchar(255), modify \`validUntil\` varchar(255), modify \`usageLimit\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`promo_codes\` add index \`promo_codes_code_index\`(\`code\`);`,
    );
    this.addSql(
      `alter table \`promo_codes\` rename index \`promo_codes_is_active_index\` to \`promo_codes_isActive_index\`;`,
    );

    this.addSql(`alter table \`roles\` drop constraint permissions;`);

    this.addSql(
      `alter table \`roles\` modify \`id\` int unsigned not null auto_increment, modify \`description\` text, modify \`permissions\` json, modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`seo_meta\` modify \`id\` int unsigned not null auto_increment, modify \`title\` varchar(255), modify \`description\` text, modify \`keywords\` varchar(255), modify \`ogTitle\` varchar(255), modify \`ogDescription\` text, modify \`ogImage\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(`alter table \`settings\` drop constraint value;`);

    this.addSql(
      `alter table \`settings\` modify \`id\` int unsigned not null auto_increment, modify \`value\` json not null, modify \`group\` varchar(255) not null default 'general';`,
    );

    this.addSql(
      `alter table \`speakers\` modify \`title\` varchar(255), modify \`organization\` varchar(255), modify \`bio\` text, modify \`avatar\` varchar(255), modify \`email\` varchar(255), modify \`phone\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`tags\` modify \`id\` int unsigned not null auto_increment, modify \`icon\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(`alter table \`templates\` drop constraint content;`);

    this.addSql(
      `alter table \`templates\` modify \`id\` int unsigned not null auto_increment, modify \`code\` varchar(255), modify \`content\` json, modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`training_levels\` modify \`code\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`training_systems\` modify \`code\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`imported_users\` modify \`accountId\` varchar(255), modify \`lastName\` varchar(255), modify \`middleName\` varchar(255), modify \`firstName\` varchar(255), modify \`accountType\` varchar(255), modify \`fullName\` varchar(255), modify \`mobilePhone\` varchar(255), modify \`email\` varchar(255), modify \`homePhone1\` varchar(255), modify \`password\` varchar(255), modify \`homePhone\` varchar(255), modify \`avatar\` varchar(255), modify \`typeId\` varchar(255), modify \`departmentId\` varchar(255), modify \`deletedAt\` varchar(255), modify \`refreshToken\` text, modify \`refreshTokenExp\` varchar(255);`,
    );

    this.addSql(
      `alter table \`users\` modify \`id\` int unsigned not null auto_increment, modify \`email\` varchar(255), modify \`name\` varchar(255), modify \`bio\` text, modify \`avatar\` varchar(255), modify \`emailVerified\` varchar(255), modify \`phone\` varchar(255), modify \`address\` varchar(255), modify \`citizenId\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );

    this.addSql(
      `alter table \`students\` modify \`id\` int unsigned not null auto_increment, modify \`name\` varchar(255), modify \`email\` varchar(255), modify \`deletedAt\` varchar(255), modify \`userId\` int unsigned;`,
    );
    this.addSql(
      `alter table \`students\` add constraint \`students_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`storage_files\` modify \`id\` int unsigned not null auto_increment, modify \`relativePath\` varchar(255) not null, modify \`uploadedByUserId\` int unsigned;`,
    );
    this.addSql(
      `alter table \`storage_files\` add constraint \`storage_files_uploadedByUserId_foreign\` foreign key (\`uploadedByUserId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`storage_files\` drop index \`storage_files_relative_path_unique\`;`,
    );
    this.addSql(
      `alter table \`storage_files\` add unique \`storage_files_relativePath_unique\`(\`relativePath\`);`,
    );
    this.addSql(
      `alter table \`storage_files\` rename index \`storage_files_uploaded_by_user_id_index\` to \`storage_files_uploadedByUserId_index\`;`,
    );

    this.addSql(
      `alter table \`sessions\` modify \`id\` int unsigned not null auto_increment, modify \`userAgent\` varchar(255), modify \`ipAddress\` varchar(255), modify \`userId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`sessions\` add constraint \`sessions_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(`alter table \`posts\` drop constraint content;`);

    this.addSql(
      `alter table \`posts\` modify \`id\` int unsigned not null auto_increment, modify \`content\` json not null, modify \`excerpt\` text, modify \`image\` varchar(255), modify \`publishedAt\` varchar(255), modify \`eventStartAt\` varchar(255), modify \`eventEndAt\` varchar(255), modify \`deletedAt\` varchar(255), modify \`authorId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`posts\` add constraint \`posts_authorId_foreign\` foreign key (\`authorId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`post_tags\` modify \`postId\` int unsigned not null, modify \`tagId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`post_tags\` add constraint \`post_tags_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`post_tags\` add constraint \`post_tags_tagId_foreign\` foreign key (\`tagId\`) references \`tags\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`post_categories\` modify \`postId\` int unsigned not null, modify \`categoryId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`post_categories\` add constraint \`post_categories_categoryId_foreign\` foreign key (\`categoryId\`) references \`categories\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`post_categories\` add constraint \`post_categories_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`parent_students\` modify \`id\` int unsigned not null auto_increment, modify \`parentId\` int unsigned not null, modify \`studentName\` varchar(255), modify \`note\` varchar(255), modify \`status\` varchar(255) not null default 'pending', modify \`reviewedBy\` varchar(255), modify \`reviewedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`parent_students\` add constraint \`parent_students_parentId_foreign\` foreign key (\`parentId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(`alter table \`orders\` drop constraint gifts;`);
    this.addSql(`alter table \`orders\` drop constraint items;`);

    this.addSql(
      `alter table \`orders\` modify \`orderNumber\` varchar(255) not null, modify \`customerId\` int unsigned, modify \`assignedShipperId\` int unsigned, modify \`customerPhone\` varchar(255), modify \`shippingAddress\` text, modify \`items\` json not null, modify \`gifts\` json, modify \`status\` varchar(255) not null default 'pending', modify \`couponCode\` varchar(255), modify \`notes\` text, modify \`paymentMethod\` varchar(255) not null default 'cod', modify \`paymentStatus\` varchar(255) not null default 'unpaid', modify \`shippedBy\` varchar(255), modify \`shippedAt\` varchar(255), modify \`deliveredBy\` varchar(255), modify \`deliveredAt\` varchar(255), modify \`cancelledAt\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`orders\` add constraint \`orders_customerId_foreign\` foreign key (\`customerId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`orders\` add constraint \`orders_assignedShipperId_foreign\` foreign key (\`assignedShipperId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`orders\` add index \`orders_orderNumber_index\`(\`orderNumber\`);`,
    );
    this.addSql(
      `alter table \`orders\` drop index \`orders_order_number_unique\`;`,
    );
    this.addSql(
      `alter table \`orders\` add unique \`orders_orderNumber_unique\`(\`orderNumber\`);`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_customer_id_index\` to \`orders_customerId_index\`;`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_assigned_shipper_id_index\` to \`orders_assignedShipperId_index\`;`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_customer_email_index\` to \`orders_customerEmail_index\`;`,
    );

    this.addSql(`alter table \`notifications\` drop constraint metadata;`);

    this.addSql(
      `alter table \`notifications\` modify \`id\` int unsigned not null auto_increment, modify \`kind\` varchar(255) not null default 'MESSAGE', modify \`description\` text, modify \`actionUrl\` varchar(255), modify \`metadata\` json, modify \`expiresAt\` varchar(255), modify \`readAt\` varchar(255), modify \`userId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`notifications\` add constraint \`notifications_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`groups\` modify \`id\` int unsigned not null auto_increment, modify \`description\` text, modify \`avatar\` varchar(255), modify \`deletedAt\` varchar(255), modify \`createdById\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`groups\` add constraint \`groups_createdById_foreign\` foreign key (\`createdById\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`messages\` modify \`id\` int unsigned not null auto_increment, modify \`type\` varchar(255) not null default 'NOTIFICATION', modify \`deletedAt\` varchar(255), modify \`parentId\` int unsigned, modify \`receiverId\` int unsigned, modify \`senderId\` int unsigned, modify \`groupId\` int unsigned;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_groupId_foreign\` foreign key (\`groupId\`) references \`groups\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_parentId_foreign\` foreign key (\`parentId\`) references \`messages\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_receiverId_foreign\` foreign key (\`receiverId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_senderId_foreign\` foreign key (\`senderId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`message_reads\` modify \`id\` int unsigned not null auto_increment, modify \`messageId\` int unsigned not null, modify \`userId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`message_reads\` add constraint \`message_reads_messageId_foreign\` foreign key (\`messageId\`) references \`messages\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`message_reads\` add constraint \`message_reads_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`group_members\` modify \`id\` int unsigned not null auto_increment, modify \`role\` varchar(255) not null default 'MEMBER', modify \`leftAt\` varchar(255), modify \`groupId\` int unsigned not null, modify \`userId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`group_members\` add constraint \`group_members_groupId_foreign\` foreign key (\`groupId\`) references \`groups\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`group_members\` add constraint \`group_members_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`face_data\` modify \`id\` int unsigned not null auto_increment, modify \`userId\` int unsigned, modify \`updatedAt\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`face_data\` add constraint \`face_data_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(`alter table \`events\` drop constraint content;`);
    this.addSql(`alter table \`events\` drop constraint poster;`);
    this.addSql(`alter table \`events\` drop constraint schedule;`);

    this.addSql(
      `alter table \`events\` modify \`id\` int unsigned not null auto_increment, modify \`slug\` varchar(255), modify \`poster\` json comment 'Poster image metadata', modify \`description\` text, modify \`content\` json comment 'Lexical rich text (JSON)', modify \`startDate\` varchar(255), modify \`endDate\` varchar(255), modify \`checkinStart\` varchar(255), modify \`checkinEnd\` varchar(255), modify \`checkoutStart\` varchar(255), modify \`checkoutEnd\` varchar(255), modify \`registrationStart\` varchar(255), modify \`registrationEnd\` varchar(255), modify \`organizer\` varchar(255), modify \`location\` varchar(255), modify \`address\` varchar(255), modify \`qrCode\` varchar(255), modify \`checkinCameraId\` int unsigned, modify \`checkoutCameraId\` int unsigned, modify \`onlineLink\` varchar(255), modify \`schedule\` json, modify \`createdById\` int unsigned, modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_checkinCameraId_foreign\` foreign key (\`checkinCameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_checkoutCameraId_foreign\` foreign key (\`checkoutCameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_createdById_foreign\` foreign key (\`createdById\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(`alter table \`event_speakers\` drop constraint attachments;`);

    this.addSql(
      `alter table \`event_speakers\` modify \`id\` int unsigned not null auto_increment, modify \`eventId\` int unsigned not null, modify \`role\` varchar(255), modify \`presentationTitle\` varchar(255), modify \`startTime\` varchar(255), modify \`endTime\` varchar(255), modify \`duration\` varchar(255), modify \`attachments\` json;`,
    );
    this.addSql(
      `alter table \`event_speakers\` add constraint \`event_speakers_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`event_registrations\` drop constraint formData;`,
    );

    this.addSql(
      `alter table \`event_registrations\` modify \`id\` int unsigned not null auto_increment, modify \`eventId\` int unsigned not null, modify \`phone\` varchar(255), modify \`registeredAt\` varchar(255), modify \`formData\` json, modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`event_registrations\` add constraint \`event_registrations_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`event_checkins\` modify \`id\` int unsigned not null auto_increment, modify \`eventId\` int unsigned not null, modify \`registrationId\` int unsigned, modify \`faceImage\` varchar(255), modify \`faceMatchScore\` varchar(255), modify \`locationData\` varchar(255), modify \`deviceInfo\` varchar(255), modify \`ipAddress\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`event_checkins\` add constraint \`event_checkins_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`event_checkins\` add constraint \`event_checkins_registrationId_foreign\` foreign key (\`registrationId\`) references \`event_registrations\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`cameras\` modify \`id\` int unsigned not null auto_increment, modify \`code\` varchar(255), modify \`linkedEventId\` int unsigned, modify \`ipAddress\` varchar(255), modify \`port\` varchar(255), modify \`username\` varchar(255), modify \`password\` varchar(255), modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`cameras\` add constraint \`cameras_linkedEventId_foreign\` foreign key (\`linkedEventId\`) references \`events\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`screens\` modify \`id\` int unsigned not null auto_increment, modify \`code\` varchar(255), modify \`cameraId\` int unsigned, modify \`templateId\` int unsigned, modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`screens\` add constraint \`screens_cameraId_foreign\` foreign key (\`cameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`screens\` add constraint \`screens_templateId_foreign\` foreign key (\`templateId\`) references \`templates\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`contact_requests\` modify \`id\` int unsigned not null auto_increment, modify \`phone\` varchar(255), modify \`status\` varchar(255) not null default 'NEW', modify \`priority\` varchar(255) not null default 'MEDIUM', modify \`userId\` int unsigned, modify \`assignedToId\` int unsigned, modify \`deletedAt\` varchar(255);`,
    );
    this.addSql(
      `alter table \`contact_requests\` add constraint \`contact_requests_assignedToId_foreign\` foreign key (\`assignedToId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`contact_requests\` add constraint \`contact_requests_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`comments\` modify \`id\` int unsigned not null auto_increment, modify \`deletedAt\` varchar(255), modify \`authorId\` int unsigned not null, modify \`postId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`comments\` add constraint \`comments_authorId_foreign\` foreign key (\`authorId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`comments\` add constraint \`comments_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`accounts\` modify \`id\` int unsigned not null auto_increment, modify \`refresh_token\` text, modify \`access_token\` text, modify \`token_type\` varchar(255), modify \`scope\` varchar(255), modify \`id_token\` text, modify \`session_state\` varchar(255), modify \`userId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`accounts\` add constraint \`accounts_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`user_roles\` modify \`id\` int unsigned not null auto_increment, modify \`userId\` int unsigned not null, modify \`roleId\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`user_roles\` add constraint \`user_roles_roleId_foreign\` foreign key (\`roleId\`) references \`roles\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`user_roles\` add constraint \`user_roles_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`accounts\` drop foreign key \`accounts_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`cameras\` drop foreign key \`cameras_linkedEventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`categories\` drop foreign key \`categories_parentId_foreign\`;`,
    );

    this.addSql(
      `alter table \`comments\` drop foreign key \`comments_authorId_foreign\`;`,
    );
    this.addSql(
      `alter table \`comments\` drop foreign key \`comments_postId_foreign\`;`,
    );

    this.addSql(
      `alter table \`contact_requests\` drop foreign key \`contact_requests_userId_foreign\`;`,
    );
    this.addSql(
      `alter table \`contact_requests\` drop foreign key \`contact_requests_assignedToId_foreign\`;`,
    );

    this.addSql(
      `alter table \`events\` drop foreign key \`events_checkinCameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`events\` drop foreign key \`events_checkoutCameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`events\` drop foreign key \`events_createdById_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_checkins\` drop foreign key \`event_checkins_eventId_foreign\`;`,
    );
    this.addSql(
      `alter table \`event_checkins\` drop foreign key \`event_checkins_registrationId_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_registrations\` drop foreign key \`event_registrations_eventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`event_speakers\` drop foreign key \`event_speakers_eventId_foreign\`;`,
    );

    this.addSql(
      `alter table \`face_data\` drop foreign key \`face_data_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`groups\` drop foreign key \`groups_createdById_foreign\`;`,
    );

    this.addSql(
      `alter table \`group_members\` drop foreign key \`group_members_groupId_foreign\`;`,
    );
    this.addSql(
      `alter table \`group_members\` drop foreign key \`group_members_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_parentId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_receiverId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_senderId_foreign\`;`,
    );
    this.addSql(
      `alter table \`messages\` drop foreign key \`messages_groupId_foreign\`;`,
    );

    this.addSql(
      `alter table \`message_reads\` drop foreign key \`message_reads_messageId_foreign\`;`,
    );
    this.addSql(
      `alter table \`message_reads\` drop foreign key \`message_reads_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`notifications\` drop foreign key \`notifications_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`orders\` drop foreign key \`orders_customerId_foreign\`;`,
    );
    this.addSql(
      `alter table \`orders\` drop foreign key \`orders_assignedShipperId_foreign\`;`,
    );

    this.addSql(
      `alter table \`parent_students\` drop foreign key \`parent_students_parentId_foreign\`;`,
    );

    this.addSql(
      `alter table \`posts\` drop foreign key \`posts_authorId_foreign\`;`,
    );

    this.addSql(
      `alter table \`post_categories\` drop foreign key \`post_categories_postId_foreign\`;`,
    );
    this.addSql(
      `alter table \`post_categories\` drop foreign key \`post_categories_categoryId_foreign\`;`,
    );

    this.addSql(
      `alter table \`post_tags\` drop foreign key \`post_tags_postId_foreign\`;`,
    );
    this.addSql(
      `alter table \`post_tags\` drop foreign key \`post_tags_tagId_foreign\`;`,
    );

    this.addSql(
      `alter table \`screens\` drop foreign key \`screens_cameraId_foreign\`;`,
    );
    this.addSql(
      `alter table \`screens\` drop foreign key \`screens_templateId_foreign\`;`,
    );

    this.addSql(
      `alter table \`sessions\` drop foreign key \`sessions_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`storage_files\` drop foreign key \`storage_files_uploadedByUserId_foreign\`;`,
    );

    this.addSql(
      `alter table \`students\` drop foreign key \`students_userId_foreign\`;`,
    );

    this.addSql(
      `alter table \`user_roles\` drop foreign key \`user_roles_userId_foreign\`;`,
    );
    this.addSql(
      `alter table \`user_roles\` drop foreign key \`user_roles_roleId_foreign\`;`,
    );

    this.addSql(
      `alter table \`academic_years\` modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`accounts\` modify \`id\` varchar(36) not null, modify \`refresh_token\` text default ('NULL'), modify \`access_token\` text default ('NULL'), modify \`token_type\` varchar(255) default 'NULL', modify \`scope\` varchar(255) default 'NULL', modify \`id_token\` text default ('NULL'), modify \`session_state\` varchar(255) default 'NULL', modify \`userId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`accounts\` add constraint \`accounts_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`admission_results\` modify \`id\` varchar(36) not null, modify \`cccd\` varchar(255) default 'NULL', modify \`soBaoDanh\` varchar(255) default 'NULL', modify \`diemMon1\` varchar(255) default 'NULL', modify \`diemMon2\` varchar(255) default 'NULL', modify \`diemMon3\` varchar(255) default 'NULL', modify \`diemTong\` varchar(255) default 'NULL', modify \`diemUuTienKhuVuc\` varchar(255) default 'NULL', modify \`diemUuTienDoiTuong\` varchar(255) default 'NULL', modify \`ghiChu\` text default ('NULL'), modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`cameras\` modify \`id\` varchar(36) not null, modify \`code\` varchar(255) default 'NULL', modify \`linkedEventId\` varchar(36) default 'NULL', modify \`ipAddress\` varchar(255) default 'NULL', modify \`port\` varchar(255) default 'NULL', modify \`username\` varchar(255) default 'NULL', modify \`password\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`cameras\` add constraint \`cameras_linkedEventId_foreign\` foreign key (\`linkedEventId\`) references \`events\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`categories\` modify \`id\` varchar(36) not null, modify \`description\` text default ('NULL'), modify \`type\` varchar(255) not null default '\\'post\\'', modify \`icon\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL', modify \`parentId\` varchar(36) default 'NULL';`,
    );
    this.addSql(
      `alter table \`categories\` add constraint \`categories_parentId_foreign\` foreign key (\`parentId\`) references \`categories\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`comments\` modify \`id\` varchar(36) not null, modify \`deletedAt\` varchar(255) default 'NULL', modify \`authorId\` varchar(36) not null, modify \`postId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`comments\` add constraint \`comments_authorId_foreign\` foreign key (\`authorId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`comments\` add constraint \`comments_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`contact_requests\` modify \`id\` varchar(36) not null, modify \`phone\` varchar(255) default 'NULL', modify \`status\` varchar(255) not null default '\\'NEW\\'', modify \`priority\` varchar(255) not null default '\\'MEDIUM\\'', modify \`userId\` varchar(36) default 'NULL', modify \`assignedToId\` varchar(36) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`contact_requests\` add constraint \`contact_requests_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`contact_requests\` add constraint \`contact_requests_assignedToId_foreign\` foreign key (\`assignedToId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`courses\` modify \`startYear\` varchar(255) default 'NULL', modify \`endYear\` varchar(255) default 'NULL', modify \`departmentId\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`customer_carts\` modify \`lines\` longtext not null, modify \`appliedPromoCode\` varchar(64) default 'NULL';`,
    );
    this.addSql(
      `alter table \`customer_carts\` rename index \`customer_carts_customerId_index\` to \`customer_carts_customer_id_index\`;`,
    );
    this.addSql(
      `alter table \`customer_carts\` drop index \`customer_carts_customerId_unique\`;`,
    );
    this.addSql(
      `alter table \`customer_carts\` add unique \`customer_carts_customer_id_unique\`(\`customerId\`);`,
    );
    this.addSql(
      `alter table \`customer_carts\` add constraint lines check(json_valid(\`lines\`));`,
    );

    this.addSql(
      `alter table \`departments\` modify \`id\` varchar(36) not null, modify \`description\` text default ('NULL'), modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`events\` modify \`id\` varchar(36) not null, modify \`slug\` varchar(255) default 'NULL', modify \`poster\` longtext default NULL comment 'Poster image metadata', modify \`description\` text default ('NULL'), modify \`content\` longtext default NULL comment 'Lexical rich text (JSON)', modify \`startDate\` varchar(255) default 'NULL', modify \`endDate\` varchar(255) default 'NULL', modify \`checkinStart\` varchar(255) default 'NULL', modify \`checkinEnd\` varchar(255) default 'NULL', modify \`checkoutStart\` varchar(255) default 'NULL', modify \`checkoutEnd\` varchar(255) default 'NULL', modify \`registrationStart\` varchar(255) default 'NULL', modify \`registrationEnd\` varchar(255) default 'NULL', modify \`organizer\` varchar(255) default 'NULL', modify \`location\` varchar(255) default 'NULL', modify \`address\` varchar(255) default 'NULL', modify \`qrCode\` varchar(255) default 'NULL', modify \`checkinCameraId\` varchar(36) default 'NULL', modify \`checkoutCameraId\` varchar(36) default 'NULL', modify \`onlineLink\` varchar(255) default 'NULL', modify \`schedule\` longtext default NULL, modify \`createdById\` varchar(36) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_checkinCameraId_foreign\` foreign key (\`checkinCameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_checkoutCameraId_foreign\` foreign key (\`checkoutCameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`events\` add constraint \`events_createdById_foreign\` foreign key (\`createdById\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`events\` add constraint content check(json_valid(\`content\`));`,
    );
    this.addSql(
      `alter table \`events\` add constraint poster check(json_valid(\`poster\`));`,
    );
    this.addSql(
      `alter table \`events\` add constraint schedule check(json_valid(\`schedule\`));`,
    );

    this.addSql(
      `alter table \`event_checkins\` modify \`id\` varchar(36) not null, modify \`eventId\` varchar(36) not null, modify \`registrationId\` varchar(36) default 'NULL', modify \`faceImage\` varchar(255) default 'NULL', modify \`faceMatchScore\` varchar(255) default 'NULL', modify \`locationData\` varchar(255) default 'NULL', modify \`deviceInfo\` varchar(255) default 'NULL', modify \`ipAddress\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`event_checkins\` add constraint \`event_checkins_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`event_checkins\` add constraint \`event_checkins_registrationId_foreign\` foreign key (\`registrationId\`) references \`event_registrations\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`event_registrations\` modify \`id\` varchar(36) not null, modify \`eventId\` varchar(36) not null, modify \`phone\` varchar(255) default 'NULL', modify \`registeredAt\` varchar(255) default 'NULL', modify \`formData\` longtext default NULL, modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`event_registrations\` add constraint \`event_registrations_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`event_registrations\` add constraint formData check(json_valid(\`formData\`));`,
    );

    this.addSql(
      `alter table \`event_speakers\` modify \`id\` varchar(36) not null, modify \`eventId\` varchar(36) not null, modify \`role\` varchar(255) default 'NULL', modify \`presentationTitle\` varchar(255) default 'NULL', modify \`startTime\` varchar(255) default 'NULL', modify \`endTime\` varchar(255) default 'NULL', modify \`duration\` varchar(255) default 'NULL', modify \`attachments\` longtext default NULL;`,
    );
    this.addSql(
      `alter table \`event_speakers\` add constraint \`event_speakers_eventId_foreign\` foreign key (\`eventId\`) references \`events\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`event_speakers\` add constraint attachments check(json_valid(\`attachments\`));`,
    );

    this.addSql(
      `alter table \`face_data\` modify \`id\` varchar(36) not null, modify \`userId\` varchar(36) default 'NULL', modify \`updatedAt\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`face_data\` add constraint \`face_data_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`groups\` modify \`id\` varchar(36) not null, modify \`description\` text default ('NULL'), modify \`avatar\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL', modify \`createdById\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`groups\` add constraint \`groups_createdById_foreign\` foreign key (\`createdById\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`group_members\` modify \`id\` varchar(36) not null, modify \`role\` varchar(255) not null default '\\'MEMBER\\'', modify \`leftAt\` varchar(255) default 'NULL', modify \`groupId\` varchar(36) not null, modify \`userId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`group_members\` add constraint \`group_members_groupId_foreign\` foreign key (\`groupId\`) references \`groups\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`group_members\` add constraint \`group_members_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`imported_users\` modify \`accountId\` varchar(255) default 'NULL', modify \`lastName\` varchar(255) default 'NULL', modify \`middleName\` varchar(255) default 'NULL', modify \`firstName\` varchar(255) default 'NULL', modify \`accountType\` varchar(255) default 'NULL', modify \`fullName\` varchar(255) default 'NULL', modify \`mobilePhone\` varchar(255) default 'NULL', modify \`email\` varchar(255) default 'NULL', modify \`homePhone1\` varchar(255) default 'NULL', modify \`password\` varchar(255) default 'NULL', modify \`homePhone\` varchar(255) default 'NULL', modify \`avatar\` varchar(255) default 'NULL', modify \`typeId\` varchar(255) default 'NULL', modify \`departmentId\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL', modify \`refreshToken\` text default ('NULL'), modify \`refreshTokenExp\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`locations\` modify \`name\` text default ('NULL'), modify \`address\` text default ('NULL'), modify \`status\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`majors\` modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`messages\` modify \`id\` varchar(36) not null, modify \`type\` varchar(255) not null default '\\'NOTIFICATION\\'', modify \`deletedAt\` varchar(255) default 'NULL', modify \`parentId\` varchar(36) default 'NULL', modify \`receiverId\` varchar(36) default 'NULL', modify \`senderId\` varchar(36) default 'NULL', modify \`groupId\` varchar(36) default 'NULL';`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_parentId_foreign\` foreign key (\`parentId\`) references \`messages\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_receiverId_foreign\` foreign key (\`receiverId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_senderId_foreign\` foreign key (\`senderId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`messages\` add constraint \`messages_groupId_foreign\` foreign key (\`groupId\`) references \`groups\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`message_reads\` modify \`id\` varchar(36) not null, modify \`messageId\` varchar(36) not null, modify \`userId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`message_reads\` add constraint \`message_reads_messageId_foreign\` foreign key (\`messageId\`) references \`messages\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`message_reads\` add constraint \`message_reads_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`notifications\` modify \`id\` varchar(36) not null, modify \`kind\` varchar(255) not null default '\\'MESSAGE\\'', modify \`description\` text default ('NULL'), modify \`actionUrl\` varchar(255) default 'NULL', modify \`metadata\` longtext default NULL, modify \`expiresAt\` varchar(255) default 'NULL', modify \`readAt\` varchar(255) default 'NULL', modify \`userId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`notifications\` add constraint \`notifications_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`notifications\` add constraint metadata check(json_valid(\`metadata\`));`,
    );

    this.addSql(
      `alter table \`orders\` drop index \`orders_orderNumber_index\`;`,
    );

    this.addSql(
      `alter table \`orders\` modify \`orderNumber\` varchar(64) not null, modify \`customerId\` varchar(36) default 'NULL', modify \`assignedShipperId\` varchar(36) default 'NULL', modify \`customerPhone\` varchar(64) default 'NULL', modify \`shippingAddress\` text default ('NULL'), modify \`items\` longtext not null, modify \`gifts\` longtext default NULL, modify \`status\` varchar(32) not null default '\\'pending\\'', modify \`couponCode\` varchar(64) default 'NULL', modify \`notes\` text default ('NULL'), modify \`paymentMethod\` varchar(16) not null default '\\'cod\\'', modify \`paymentStatus\` varchar(16) not null default '\\'unpaid\\'', modify \`shippedBy\` varchar(36) default 'NULL', modify \`shippedAt\` datetime default NULL, modify \`deliveredBy\` varchar(36) default 'NULL', modify \`deliveredAt\` datetime default NULL, modify \`cancelledAt\` datetime default NULL, modify \`deletedAt\` datetime default NULL;`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_assignedShipperId_index\` to \`orders_assigned_shipper_id_index\`;`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_customerEmail_index\` to \`orders_customer_email_index\`;`,
    );
    this.addSql(
      `alter table \`orders\` rename index \`orders_customerId_index\` to \`orders_customer_id_index\`;`,
    );
    this.addSql(
      `alter table \`orders\` drop index \`orders_orderNumber_unique\`;`,
    );
    this.addSql(
      `alter table \`orders\` add unique \`orders_order_number_unique\`(\`orderNumber\`);`,
    );
    this.addSql(
      `alter table \`orders\` add constraint gifts check(json_valid(\`gifts\`));`,
    );
    this.addSql(
      `alter table \`orders\` add constraint items check(json_valid(\`items\`));`,
    );

    this.addSql(
      `alter table \`page_contents\` modify \`id\` varchar(36) not null, modify \`content\` longtext not null;`,
    );
    this.addSql(
      `alter table \`page_contents\` add constraint content check(json_valid(\`content\`));`,
    );

    this.addSql(
      `alter table \`parent_students\` modify \`id\` varchar(36) not null, modify \`parentId\` varchar(36) not null, modify \`studentName\` varchar(255) default 'NULL', modify \`note\` varchar(255) default 'NULL', modify \`status\` varchar(255) not null default '\\'pending\\'', modify \`reviewedBy\` varchar(255) default 'NULL', modify \`reviewedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`parent_students\` add constraint \`parent_students_parentId_foreign\` foreign key (\`parentId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`posts\` modify \`id\` varchar(36) not null, modify \`content\` longtext not null, modify \`excerpt\` text default ('NULL'), modify \`image\` varchar(255) default 'NULL', modify \`publishedAt\` varchar(255) default 'NULL', modify \`eventStartAt\` varchar(255) default 'NULL', modify \`eventEndAt\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL', modify \`authorId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`posts\` add constraint \`posts_authorId_foreign\` foreign key (\`authorId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`posts\` add constraint content check(json_valid(\`content\`));`,
    );

    this.addSql(
      `alter table \`post_categories\` modify \`postId\` varchar(36) not null, modify \`categoryId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`post_categories\` add constraint \`post_categories_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`post_categories\` add constraint \`post_categories_categoryId_foreign\` foreign key (\`categoryId\`) references \`categories\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`post_tags\` modify \`postId\` varchar(36) not null, modify \`tagId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`post_tags\` add constraint \`post_tags_postId_foreign\` foreign key (\`postId\`) references \`posts\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`post_tags\` add constraint \`post_tags_tagId_foreign\` foreign key (\`tagId\`) references \`tags\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(`alter table \`products\` drop index \`products_sku_index\`;`);

    this.addSql(
      `alter table \`products\` modify \`description\` text default ('NULL'), modify \`brand\` varchar(255) default 'NULL', modify \`origin\` varchar(255) default 'NULL', modify \`unit\` varchar(64) not null default '\\'cai\\'', modify \`unitTypes\` longtext default NULL, modify \`images\` longtext default NULL, modify \`coupons\` longtext default NULL, modify \`fulfillmentNote\` text default ('NULL'), modify \`deletedAt\` datetime default NULL;`,
    );
    this.addSql(
      `alter table \`products\` rename index \`products_isActive_index\` to \`products_is_active_index\`;`,
    );
    this.addSql(
      `alter table \`products\` add constraint coupons check(json_valid(\`coupons\`));`,
    );
    this.addSql(
      `alter table \`products\` add constraint images check(json_valid(\`images\`));`,
    );
    this.addSql(
      `alter table \`products\` add constraint unitTypes check(json_valid(\`unitTypes\`));`,
    );

    this.addSql(
      `alter table \`promo_codes\` drop index \`promo_codes_code_index\`;`,
    );

    this.addSql(
      `alter table \`promo_codes\` modify \`code\` varchar(64) not null, modify \`discountKind\` varchar(16) not null default '\\'fixed\\'', modify \`discountCapVnd\` int default NULL, modify \`validFrom\` datetime default NULL, modify \`validUntil\` datetime default NULL, modify \`usageLimit\` int default NULL, modify \`deletedAt\` datetime default NULL;`,
    );
    this.addSql(
      `alter table \`promo_codes\` rename index \`promo_codes_isActive_index\` to \`promo_codes_is_active_index\`;`,
    );

    this.addSql(
      `alter table \`roles\` modify \`id\` varchar(36) not null, modify \`description\` text default ('NULL'), modify \`permissions\` longtext default NULL, modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`roles\` add constraint permissions check(json_valid(\`permissions\`));`,
    );

    this.addSql(
      `alter table \`screens\` modify \`id\` varchar(36) not null, modify \`code\` varchar(255) default 'NULL', modify \`cameraId\` varchar(36) default 'NULL', modify \`templateId\` varchar(36) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`screens\` add constraint \`screens_cameraId_foreign\` foreign key (\`cameraId\`) references \`cameras\` (\`id\`) on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table \`screens\` add constraint \`screens_templateId_foreign\` foreign key (\`templateId\`) references \`templates\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`seo_meta\` modify \`id\` varchar(36) not null, modify \`title\` varchar(255) default 'NULL', modify \`description\` text default ('NULL'), modify \`keywords\` varchar(255) default 'NULL', modify \`ogTitle\` varchar(255) default 'NULL', modify \`ogDescription\` text default ('NULL'), modify \`ogImage\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`sessions\` modify \`id\` varchar(36) not null, modify \`userAgent\` varchar(255) default 'NULL', modify \`ipAddress\` varchar(255) default 'NULL', modify \`userId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`sessions\` add constraint \`sessions_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table \`settings\` modify \`id\` varchar(36) not null, modify \`value\` longtext not null, modify \`group\` varchar(255) not null default '\\'general\\'';`,
    );
    this.addSql(
      `alter table \`settings\` add constraint value check(json_valid(\`value\`));`,
    );

    this.addSql(
      `alter table \`speakers\` modify \`title\` varchar(255) default 'NULL', modify \`organization\` varchar(255) default 'NULL', modify \`bio\` text default ('NULL'), modify \`avatar\` varchar(255) default 'NULL', modify \`email\` varchar(255) default 'NULL', modify \`phone\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`storage_files\` modify \`id\` varchar(36) not null, modify \`relativePath\` varchar(512) not null, modify \`uploadedByUserId\` varchar(36) default 'NULL';`,
    );
    this.addSql(
      `alter table \`storage_files\` drop index \`storage_files_relativePath_unique\`;`,
    );
    this.addSql(
      `alter table \`storage_files\` add unique \`storage_files_relative_path_unique\`(\`relativePath\`);`,
    );
    this.addSql(
      `alter table \`storage_files\` rename index \`storage_files_uploadedByUserId_index\` to \`storage_files_uploaded_by_user_id_index\`;`,
    );

    this.addSql(
      `alter table \`students\` modify \`id\` varchar(36) not null, modify \`name\` varchar(255) default 'NULL', modify \`email\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL', modify \`userId\` varchar(36) default 'NULL';`,
    );
    this.addSql(
      `alter table \`students\` add constraint \`students_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table \`tags\` modify \`id\` varchar(36) not null, modify \`icon\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`templates\` modify \`id\` varchar(36) not null, modify \`code\` varchar(255) default 'NULL', modify \`content\` longtext default NULL, modify \`deletedAt\` varchar(255) default 'NULL';`,
    );
    this.addSql(
      `alter table \`templates\` add constraint content check(json_valid(\`content\`));`,
    );

    this.addSql(
      `alter table \`training_levels\` modify \`code\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`training_systems\` modify \`code\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`users\` modify \`id\` varchar(36) not null, modify \`email\` varchar(255) default 'NULL', modify \`name\` varchar(255) default 'NULL', modify \`bio\` text default ('NULL'), modify \`avatar\` varchar(255) default 'NULL', modify \`emailVerified\` varchar(255) default 'NULL', modify \`phone\` varchar(255) default 'NULL', modify \`address\` varchar(255) default 'NULL', modify \`citizenId\` varchar(255) default 'NULL', modify \`deletedAt\` varchar(255) default 'NULL';`,
    );

    this.addSql(
      `alter table \`user_roles\` modify \`id\` varchar(36) not null, modify \`userId\` varchar(36) not null, modify \`roleId\` varchar(36) not null;`,
    );
    this.addSql(
      `alter table \`user_roles\` add constraint \`user_roles_userId_foreign\` foreign key (\`userId\`) references \`users\` (\`id\`) on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table \`user_roles\` add constraint \`user_roles_roleId_foreign\` foreign key (\`roleId\`) references \`roles\` (\`id\`) on update cascade on delete cascade;`,
    );
  }
}
