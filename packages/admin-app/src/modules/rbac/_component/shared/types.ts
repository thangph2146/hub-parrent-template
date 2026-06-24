export type { RbacPermission, RbacRole } from "@workspace/api-client"

export type CreateRoleInput = {
  code: string
  name: string
  displayName?: string
  description?: string | null
  permissionCodes: string[]
  isActive?: boolean
}

export type UpdateRoleInput = Partial<CreateRoleInput>
