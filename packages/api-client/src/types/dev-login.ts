export type DevLoginRole = {
  id: number
  name: string
  displayName: string
}

/** User + roles từ bảng `users` — chỉ dùng dev login local. */
export type DevLoginOption = {
  id: number
  email: string
  name: string | null
  isActive: boolean
  roleNames: string[]
  roleLabels: string[]
  roles: DevLoginRole[]
  description: string
}

export type DevLoginOptionsQuery = {
  role?: string
  roles?: string
  excludeRoles?: string
  emailSuffix?: string
  activeOnly?: boolean
}
