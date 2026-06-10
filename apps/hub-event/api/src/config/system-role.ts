export const SYSTEM_SUPER_ADMIN_ROLE_NAME = 'super_admin';

export function isSystemSuperAdminRoleName(
  name: string | null | undefined,
): boolean {
  return name?.trim().toLowerCase() === SYSTEM_SUPER_ADMIN_ROLE_NAME;
}
