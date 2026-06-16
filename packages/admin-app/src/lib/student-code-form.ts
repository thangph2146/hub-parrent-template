import { z } from "zod"
import {
  NUMERIC_STUDENT_CODE_PATTERN,
  validateNumericStudentCode,
} from "@workspace/api-client"

export const OPTIONAL_STUDENT_CODE_ERROR =
  "Mã số sinh viên phải là số (5–12 chữ số)."

/** Zod field — MSSV tuỳ chọn; nếu có thì 5–12 chữ số. */
export function optionalStudentCodeZodField() {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        const trimmed = val?.trim() ?? ""
        if (!trimmed) return true
        return NUMERIC_STUDENT_CODE_PATTERN.test(trimmed)
      },
      { message: OPTIONAL_STUDENT_CODE_ERROR },
    )
}

export function normalizeOptionalStudentCode(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? ""
  return trimmed || null
}

export type StudentCodeAvatarUploadGate = {
  studentCode: string
  studentCodeDirty: boolean
}

/** `null` = được upload; string = lý do chặn (toast). */
export function getStudentCodeAvatarUploadBlockReason(
  gate: StudentCodeAvatarUploadGate,
): string | null {
  const trimmed = gate.studentCode.trim()
  if (!trimmed) return null
  const validationError = validateNumericStudentCode(trimmed)
  if (validationError) return validationError
  if (gate.studentCodeDirty) {
    return "Lưu thay đổi MSSV trước khi tải ảnh."
  }
  return null
}
