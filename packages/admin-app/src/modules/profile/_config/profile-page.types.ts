export type AdminProfilePageConfig = {
  subtitle: string
  /**
   * Số lần được phép đổi ảnh đại diện.
   * Bỏ qua = không giới hạn (admin/BTC).
   * `1` = một lần duy nhất (cổng sinh viên).
   * `0` = không cho phép đổi ảnh.
   */
  maxAvatarChanges?: number
  /** `account` — GET/PUT `/admin/accounts` (cổng SV/khách). Mặc định `staff`. */
  profileSource?: "staff" | "account"
  /** Gợi ý ảnh chân dung cho HANET (registerByUrl). */
  avatarGuidance?: string
  /** `accept` trên input file — mặc định `image/*`. */
  avatarAccept?: string
  /** Hiện trường địa chỉ / văn phòng. Mặc định `true`. */
  showAddress?: boolean
  /** Hiện khối đổi mật khẩu. Mặc định `true`. */
  showChangePassword?: boolean
  /** Hiện mã số sinh viên. Cổng SV: cho phép nhập (chỉ số). */
  showStudentCode?: boolean
  /** Cho phép chỉnh MSSV trên form. Mặc định theo `showStudentCode`. */
  studentCodeEditable?: boolean
  contactSectionTitle?: string
  contactSectionDescription?: string
  /**
   * `split` — avatar cột trái + form cột phải (admin mặc định).
   * `stack` — full-width: identity band + form grid (cổng sinh viên).
   */
  layout?: "split" | "stack"
  /** Hiện input URL ảnh. Mặc định `true`; cổng SV chỉ upload file. */
  showAvatarUrl?: boolean
}
