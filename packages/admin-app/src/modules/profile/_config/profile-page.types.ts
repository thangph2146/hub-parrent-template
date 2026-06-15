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
}
