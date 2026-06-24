import type { CreateUserInput, UpdateUserInput } from "@workspace/api-client"

import type { StaffFormValues } from "../_hooks/staff-form.schema"

export type StaffSubmitPayload = {
  email: string
  fullName: string
  password: string
  isActive: boolean
  roleCodes: string[]
  avatar?: string | null
  phone?: string | null
  address?: string | null
  citizenId?: string | null
  studentCode?: string | null
}

export type StaffCreateInput = Pick<
  CreateUserInput,
  | "email"
  | "fullName"
  | "password"
  | "isActive"
  | "roleCodes"
  | "phone"
  | "address"
  | "citizenId"
  | "studentCode"
>

export type StaffUpdateInput = Pick<
  UpdateUserInput,
  | "fullName"
  | "password"
  | "isActive"
  | "roleCodes"
  | "avatar"
  | "phone"
  | "address"
  | "citizenId"
  | "studentCode"
>

export function buildStaffSubmitPayload(
  values: StaffFormValues,
  editingId?: string | null,
): StaffSubmitPayload {
  const payload: StaffSubmitPayload = {
    fullName: values.fullName.trim(),
    isActive: values.isActive,
    email: values.email.trim(),
    password: "",
    roleCodes: values.roleCodes,
    avatar: values.avatar?.trim() || null,
    phone: values.phone?.trim() || null,
    address: values.address?.trim() || null,
    citizenId: values.citizenId?.trim() || null,
    studentCode: values.studentCode?.trim() || null,
  }

  if (!editingId) {
    payload.password = values.password?.trim() || ""
  } else {
    const password = values.password?.trim()
    payload.password = password || ""
  }

  return payload
}
