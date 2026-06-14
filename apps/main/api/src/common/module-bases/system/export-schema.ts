/** Legacy Vietnamese table keys → export model name (camelCase entity key). */
export const LEGACY_TABLE_TO_MODEL: Record<string, string> = {
  namhoc: 'academicYear',
  khoahoc: 'course',
  nganhhoc: 'major',
  bachoc: 'trainingLevel',
  hedaotao: 'trainingSystem',
  diengia: 'speaker',
  diadiem: 'location',
  nguoidung: 'importedUser',
};

/** Legacy DB column / export field → canonical English property name. */
export const LEGACY_IMPORT_FIELD_ALIASES: Record<
  string,
  Record<string, string>
> = {
  AcademicYear: {
    ten_nam_hoc: 'name',
    ngay_bat_dau: 'startDate',
    ngay_ket_thuc: 'endDate',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  Course: {
    ten_khoa_hoc: 'name',
    nam_bat_dau: 'startYear',
    nam_ket_thuc: 'endYear',
    phong_khoa_id: 'departmentId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  Major: {
    ten_nganh: 'name',
    ma_nganh: 'code',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  TrainingLevel: {
    ten_bachoc: 'name',
    ma_bachoc: 'code',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  TrainingSystem: {
    ten_he_dao_tao: 'name',
    ma_he_dao_tao: 'code',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  Speaker: {
    ten_dien_gia: 'name',
    chuc_danh: 'title',
    to_chuc: 'organization',
    gioi_thieu: 'bio',
    dien_thoai: 'phone',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  Location: {
    url_bando: 'mapUrl',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
  },
  ImportedUser: {
    AccountId: 'accountId',
    LastName: 'lastName',
    MiddleName: 'middleName',
    FirstName: 'firstName',
    AccountType: 'accountType',
    FullName: 'fullName',
    MobilePhone: 'mobilePhone',
    Email: 'email',
    HomePhone1: 'homePhone1',
    PW: 'password',
    HomePhone: 'homePhone',
    Avatar: 'avatar',
    CanUploadAvatar: 'canUploadAvatar',
    loai_id: 'typeId',
    nam_hoc_id: 'academicYearId',
    bac_hoc_id: 'trainingLevelId',
    he_dao_tao_id: 'trainingSystemId',
    nganh_id: 'majorId',
    phong_khoa_id: 'departmentId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    deleted_at: 'deletedAt',
    refresh_token: 'refreshToken',
    refresh_token_exp: 'refreshTokenExp',
  },
};

export function resolveLegacyTableModelName(
  tableKey: string,
): string | undefined {
  return LEGACY_TABLE_TO_MODEL[tableKey.toLowerCase()];
}

/** Chuẩn hóa row import từ file export cũ (tên bảng/cột tiếng Việt). */
export function normalizeLegacyImportRow(
  entityKey: string,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const aliases = LEGACY_IMPORT_FIELD_ALIASES[entityKey];
  if (!aliases) return row;

  const out: Record<string, unknown> = { ...row };
  for (const [legacyKey, canonicalKey] of Object.entries(aliases)) {
    if (
      !Object.prototype.hasOwnProperty.call(out, canonicalKey) &&
      Object.prototype.hasOwnProperty.call(out, legacyKey)
    ) {
      out[canonicalKey] = out[legacyKey];
    }
    if (
      legacyKey !== canonicalKey &&
      Object.prototype.hasOwnProperty.call(out, legacyKey)
    ) {
      delete out[legacyKey];
    }
  }
  return out;
}
