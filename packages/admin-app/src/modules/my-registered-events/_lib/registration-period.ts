export type RegistrationWindowState =
  | { open: true }
  | { open: false; reason: string }

/** Còn trong khung đăng ký (registrationStart → registrationEnd). */
export function getRegistrationPeriodState(event: {
  registrationStart?: string | null
  registrationEnd?: string | null
  startDate?: string | null
}): RegistrationWindowState {
  const now = Date.now()
  const hasStart = Boolean(event.registrationStart?.trim())
  const hasEnd = Boolean(event.registrationEnd?.trim())

  if (!hasStart && !hasEnd) {
    if (event.startDate) {
      const startMs = Date.parse(event.startDate)
      if (!Number.isNaN(startMs) && now >= startMs) {
        return {
          open: false,
          reason: "Sự kiện đã bắt đầu, không thể hủy đăng ký.",
        }
      }
    }
    return { open: true }
  }

  if (hasStart) {
    const startMs = Date.parse(event.registrationStart!)
    if (!Number.isNaN(startMs) && now < startMs) {
      return { open: false, reason: "Chưa đến thời gian đăng ký." }
    }
  }

  if (hasEnd) {
    const endMs = Date.parse(event.registrationEnd!)
    if (!Number.isNaN(endMs) && now > endMs) {
      return { open: false, reason: "Đã hết thời hạn đăng ký." }
    }
  }

  return { open: true }
}
