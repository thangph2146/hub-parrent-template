/** MSSV — 5–12 chữ số (không ký tự đặc biệt). */
export const NUMERIC_STUDENT_CODE_PATTERN = /^\d{5,12}$/;

export function normalizeNumericStudentCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!NUMERIC_STUDENT_CODE_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateNumericStudentCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Vui lòng nhập mã số sinh viên.";
  if (!NUMERIC_STUDENT_CODE_PATTERN.test(trimmed)) {
    return "Mã số sinh viên phải là số (5–12 chữ số).";
  }
  return null;
}
