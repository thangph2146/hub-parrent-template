/** Diễn giải lỗi Partner API check-in theo ngày sang tiếng Việt. */
export function formatHanetCheckinError(message: string): string {
  const quota = /total face in place (\d+) is greater than total face purchased (\d+)/i.exec(
    message,
  )
  if (quota) {
    const [, registered, purchased] = quota
    return (
      `Địa điểm đang có ${registered} khuôn mặt đăng ký trên HANET, trong khi gói Partner API ` +
      `chỉ cho phép đọc dữ liệu tối đa ${purchased} khuôn mặt/place. ` +
      `Để xem check-in theo ngày: (1) chọn place có ít người hơn, (2) xóa bớt người trên app HANET ` +
      `(Quản lý nhân viên/khách), hoặc (3) liên hệ HANET nâng hạn mức gói.`
    )
  }

  return message
}
