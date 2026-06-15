import { Migration } from '@mikro-orm/migrations';

/**
 * Đổi tên bảng/cột legacy (tiếng Việt) sang tên tiếng Anh chuẩn.
 * Chạy: pnpm --filter @api run db:migration:up
 */
export class Migration20260605120000_standardize_legacy_table_names extends Migration {
  /** DB mới (schema:create) không có bảng legacy — bỏ qua. */
  override async up(): Promise<void> {
    const hasLegacy = await this.getKnex().schema.hasTable('nguoidung');
    if (!hasLegacy) return;

    this.addSql(
      'alter table `nguoidung` drop foreign key `nguoidung_nam_hoc_id_foreign`;',
    );
    this.addSql(
      'alter table `nguoidung` drop foreign key `nguoidung_bac_hoc_id_foreign`;',
    );
    this.addSql(
      'alter table `nguoidung` drop foreign key `nguoidung_he_dao_tao_id_foreign`;',
    );
    this.addSql(
      'alter table `nguoidung` drop foreign key `nguoidung_nganh_id_foreign`;',
    );
    this.addSql(
      'alter table `event_speakers` drop foreign key `event_speakers_speakerId_foreign`;',
    );

    this.addSql(
      'rename table `namhoc` to `academic_years`, `bachoc` to `training_levels`, `hedaotao` to `training_systems`, `nganhhoc` to `majors`, `khoahoc` to `courses`, `diadiem` to `locations`, `diengia` to `speakers`, `nguoidung` to `imported_users`;',
    );

    this.addSql(
      'alter table `academic_years` change `ten_nam_hoc` `name` varchar(255) not null, change `ngay_bat_dau` `startDate` date null, change `ngay_ket_thuc` `endDate` date null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `courses` change `ten_khoa_hoc` `name` varchar(255) not null, change `nam_bat_dau` `startYear` int null, change `nam_ket_thuc` `endYear` int null, change `phong_khoa_id` `departmentId` varchar(255) null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `majors` change `ten_nganh` `name` varchar(255) not null, change `ma_nganh` `code` varchar(255) not null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `training_levels` change `ten_bachoc` `name` varchar(255) not null, change `ma_bachoc` `code` varchar(255) null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `training_systems` change `ten_he_dao_tao` `name` varchar(255) not null, change `ma_he_dao_tao` `code` varchar(255) null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `speakers` change `ten_dien_gia` `name` varchar(255) not null, change `chuc_danh` `title` varchar(255) null, change `to_chuc` `organization` varchar(255) null, change `gioi_thieu` `bio` text null, change `dien_thoai` `phone` varchar(255) null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null;',
    );
    this.addSql(
      'alter table `locations` change `url_bando` `mapUrl` varchar(255) not null, change `created_at` `createdAt` datetime not null, change `updated_at` `updatedAt` datetime not null, change `deleted_at` `deletedAt` varchar(255) null;',
    );

    this.addSql(
      'alter table `imported_users` change `AccountId` `accountId` varchar(255) null, change `LastName` `lastName` varchar(255) null, change `MiddleName` `middleName` varchar(255) null, change `FirstName` `firstName` varchar(255) null, change `AccountType` `accountType` varchar(255) null, change `FullName` `fullName` varchar(255) null, change `MobilePhone` `mobilePhone` varchar(255) null, change `Email` `email` varchar(255) null, change `HomePhone1` `homePhone1` varchar(255) null, change `PW` `password` varchar(255) null, change `HomePhone` `homePhone` varchar(255) null, change `Avatar` `avatar` varchar(255) null, change `CanUploadAvatar` `canUploadAvatar` int not null default 1, change `loai_id` `typeId` varchar(255) null, change `nam_hoc_id` `academicYearId` int unsigned null, change `bac_hoc_id` `trainingLevelId` int unsigned null, change `he_dao_tao_id` `trainingSystemId` int unsigned null, change `nganh_id` `majorId` int unsigned null, change `phong_khoa_id` `departmentId` varchar(255) null, change `created_at` `createdAt` datetime null, change `updated_at` `updatedAt` datetime null, change `deleted_at` `deletedAt` varchar(255) null, change `refresh_token` `refreshToken` text null, change `refresh_token_exp` `refreshTokenExp` varchar(255) null;',
    );

    this.addSql(
      'alter table `imported_users` add constraint `imported_users_academic_year_id_foreign` foreign key (`academicYearId`) references `academic_years` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `imported_users` add constraint `imported_users_training_level_id_foreign` foreign key (`trainingLevelId`) references `training_levels` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `imported_users` add constraint `imported_users_training_system_id_foreign` foreign key (`trainingSystemId`) references `training_systems` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `imported_users` add constraint `imported_users_major_id_foreign` foreign key (`majorId`) references `majors` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `event_speakers` add constraint `event_speakers_speakerId_foreign` foreign key (`speakerId`) references `speakers` (`id`) on update cascade on delete cascade;',
    );
  }

  override down(): void {
    this.addSql(
      'alter table `imported_users` drop foreign key `imported_users_academic_year_id_foreign`;',
    );
    this.addSql(
      'alter table `imported_users` drop foreign key `imported_users_training_level_id_foreign`;',
    );
    this.addSql(
      'alter table `imported_users` drop foreign key `imported_users_training_system_id_foreign`;',
    );
    this.addSql(
      'alter table `imported_users` drop foreign key `imported_users_major_id_foreign`;',
    );
    this.addSql(
      'alter table `event_speakers` drop foreign key `event_speakers_speakerId_foreign`;',
    );

    this.addSql(
      'alter table `imported_users` change `accountId` `AccountId` varchar(255) null, change `lastName` `LastName` varchar(255) null, change `middleName` `MiddleName` varchar(255) null, change `firstName` `FirstName` varchar(255) null, change `accountType` `AccountType` varchar(255) null, change `fullName` `FullName` varchar(255) null, change `mobilePhone` `MobilePhone` varchar(255) null, change `email` `Email` varchar(255) null, change `homePhone1` `HomePhone1` varchar(255) null, change `password` `PW` varchar(255) null, change `homePhone` `HomePhone` varchar(255) null, change `avatar` `Avatar` varchar(255) null, change `canUploadAvatar` `CanUploadAvatar` int not null default 1, change `typeId` `loai_id` varchar(255) null, change `academicYearId` `nam_hoc_id` int unsigned null, change `trainingLevelId` `bac_hoc_id` int unsigned null, change `trainingSystemId` `he_dao_tao_id` int unsigned null, change `majorId` `nganh_id` int unsigned null, change `departmentId` `phong_khoa_id` varchar(255) null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null, change `refreshToken` `refresh_token` text null, change `refreshTokenExp` `refresh_token_exp` varchar(255) null;',
    );
    this.addSql(
      'alter table `locations` change `mapUrl` `url_bando` varchar(255) not null, change `createdAt` `created_at` datetime not null, change `updatedAt` `updated_at` datetime not null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `speakers` change `name` `ten_dien_gia` varchar(255) not null, change `title` `chuc_danh` varchar(255) null, change `organization` `to_chuc` varchar(255) null, change `bio` `gioi_thieu` text null, change `phone` `dien_thoai` varchar(255) null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `training_systems` change `name` `ten_he_dao_tao` varchar(255) not null, change `code` `ma_he_dao_tao` varchar(255) null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `training_levels` change `name` `ten_bachoc` varchar(255) not null, change `code` `ma_bachoc` varchar(255) null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `majors` change `name` `ten_nganh` varchar(255) not null, change `code` `ma_nganh` varchar(255) not null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `courses` change `name` `ten_khoa_hoc` varchar(255) not null, change `startYear` `nam_bat_dau` int null, change `endYear` `nam_ket_thuc` int null, change `departmentId` `phong_khoa_id` varchar(255) null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );
    this.addSql(
      'alter table `academic_years` change `name` `ten_nam_hoc` varchar(255) not null, change `startDate` `ngay_bat_dau` date null, change `endDate` `ngay_ket_thuc` date null, change `createdAt` `created_at` datetime null, change `updatedAt` `updated_at` datetime null, change `deletedAt` `deleted_at` varchar(255) null;',
    );

    this.addSql(
      'rename table `academic_years` to `namhoc`, `training_levels` to `bachoc`, `training_systems` to `hedaotao`, `majors` to `nganhhoc`, `courses` to `khoahoc`, `locations` to `diadiem`, `speakers` to `diengia`, `imported_users` to `nguoidung`;',
    );

    this.addSql(
      'alter table `nguoidung` add constraint `nguoidung_nam_hoc_id_foreign` foreign key (`nam_hoc_id`) references `namhoc` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `nguoidung` add constraint `nguoidung_bac_hoc_id_foreign` foreign key (`bac_hoc_id`) references `bachoc` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `nguoidung` add constraint `nguoidung_he_dao_tao_id_foreign` foreign key (`he_dao_tao_id`) references `hedaotao` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `nguoidung` add constraint `nguoidung_nganh_id_foreign` foreign key (`nganh_id`) references `nganhhoc` (`id`) on update cascade on delete set null;',
    );
    this.addSql(
      'alter table `event_speakers` add constraint `event_speakers_speakerId_foreign` foreign key (`speakerId`) references `diengia` (`id`) on update cascade on delete cascade;',
    );
  }
}
