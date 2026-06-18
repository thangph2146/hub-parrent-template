export const NUMERIC_STUDENT_CODE_PATTERN = /^\d{5,12}$/;

export const STUDENT_SCHOOL_EMAIL_SUFFIX = '@st.buh.edu.vn';

export function normalizeNumericStudentCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  if (!NUMERIC_STUDENT_CODE_PATTERN.test(trimmed)) return null;
  return trimmed;
}

/** Chỉ suy ra MSSV khi phần trước @ là toàn số (vd. `221234567@st.buh.edu.vn`). */
export function studentCodeFromSchoolEmail(
  email: string | null | undefined,
): string | null {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized.endsWith(STUDENT_SCHOOL_EMAIL_SUFFIX)) return null;
  const local = normalized.slice(0, -STUDENT_SCHOOL_EMAIL_SUFFIX.length);
  return normalizeNumericStudentCode(local);
}

export function studentAvatarFolderPath(studentCode: string): string {
  return avatarFolderPath(studentCode);
}

/** Segment thư mục avatar: MSSV hoặc user id (chỉ chữ số). */
export const AVATAR_FOLDER_SEGMENT_PATTERN = /^\d{1,12}$/;

export function normalizeAvatarFolderSegment(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  if (!AVATAR_FOLDER_SEGMENT_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function avatarFolderPath(segment: string): string {
  return `avatars/${segment}`;
}

/** MSSV nếu hợp lệ, không thì user id — dùng làm tên folder avatar. */
export function resolveAvatarFolderSegment(options: {
  studentCode?: string | null;
  userId: string | number;
}): string {
  const code = normalizeNumericStudentCode(options.studentCode);
  if (code) return code;
  return String(options.userId);
}

export function resolveAvatarFolderPath(options: {
  studentCode?: string | null;
  userId: string | number;
}): string {
  return avatarFolderPath(resolveAvatarFolderSegment(options));
}

export function isStudentAccountRole(
  roles: Array<{ name: string }> | undefined,
): boolean {
  return roles?.some((role) => role.name === 'student') === true;
}
