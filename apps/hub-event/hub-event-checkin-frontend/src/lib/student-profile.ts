import { api } from "./api"
import type { AccountProfile } from "@workspace/api-client"

export type StudentAccountProfile = AccountProfile

export type UpdateStudentProfileInput = {
  name?: string
  phone?: string | null
  address?: string | null
  avatar?: string | null
  password?: string
}

export async function fetchStudentProfile(): Promise<StudentAccountProfile> {
  return api.accounts.get()
}

export async function updateStudentProfile(
  input: UpdateStudentProfileInput,
): Promise<StudentAccountProfile> {
  return api.accounts.update(input)
}

export async function uploadStudentAvatar(file: File): Promise<string> {
  const result = await api.accounts.uploadAvatar(file)
  if (!result.url?.trim()) {
    throw new Error("Upload thất bại")
  }
  return result.url
}
