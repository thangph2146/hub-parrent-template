import { fetchStudentApi } from "@/lib/event-auth"

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  error?: string | null
  data?: T
}

export type StudentAccountProfile = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  bio: string | null
  phone: string | null
  address: string | null
  emailVerified: string | null
  createdAt: string
  updatedAt: string
  roles: Array<{ id: string; name: string; displayName: string }>
}

export type UpdateStudentProfileInput = {
  name?: string
  phone?: string | null
  address?: string | null
  avatar?: string | null
  password?: string
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || !json?.success || json.data === undefined) {
    throw new Error(
      json?.message || json?.error || `Yêu cầu thất bại (${res.status}).`
    )
  }
  return json.data
}

export async function fetchStudentProfile(): Promise<StudentAccountProfile> {
  const res = await fetchStudentApi("/admin/accounts")
  return parseEnvelope<StudentAccountProfile>(res)
}

export async function updateStudentProfile(
  input: UpdateStudentProfileInput
): Promise<StudentAccountProfile> {
  const res = await fetchStudentApi("/admin/accounts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseEnvelope<StudentAccountProfile>(res)
}

export async function uploadStudentAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("folderPath", "avatars")
  const res = await fetchStudentApi("/admin/uploads", {
    method: "POST",
    body: fd,
  })
  const json = (await res.json().catch(() => null)) as ApiEnvelope<{
    url?: string
  }> | null
  if (!res.ok || !json?.success || !json.data?.url) {
    throw new Error(json?.message || json?.error || "Upload thất bại")
  }
  return json.data.url
}
