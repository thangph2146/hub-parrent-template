/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Email sinh viên HUB Events — đăng nhập kênh Sinh viên (email / Google). */
export const EVENT_STUDENT_EMAIL_SUFFIX = '@st.buh.edu.vn';

export const EVENT_STUDENT_EMAIL_ERROR =
  'Vui lòng đăng nhập bằng email sinh viên @st.buh.edu.vn.';

export function isEventStudentSchoolEmail(
  email: string | null | undefined,
): boolean {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized) return false;
  return normalized.endsWith(EVENT_STUDENT_EMAIL_SUFFIX);
}
