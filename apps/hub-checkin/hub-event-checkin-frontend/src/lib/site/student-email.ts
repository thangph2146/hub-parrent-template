export const STUDENT_EMAIL_SUFFIX = "@st.buh.edu.vn"

export const STUDENT_EMAIL_ERROR =
  "Vui lòng đăng nhập bằng email sinh viên @st.buh.edu.vn."

export function isStudentSchoolEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase() ?? ""
  if (!normalized) return false
  return normalized.endsWith(STUDENT_EMAIL_SUFFIX)
}

export function assertStudentSchoolEmail(email: string): void {
  if (!isStudentSchoolEmail(email)) {
    throw new Error(STUDENT_EMAIL_ERROR)
  }
}
