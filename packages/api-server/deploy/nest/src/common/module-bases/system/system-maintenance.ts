import { AUTH_ROLE_NAMES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import type { AuthLoginPayload } from '../auth/auth.service';

/** Khớp admin `/data`: settings:manage|import|export hoặc system:manage|import. */
export const SYSTEM_MAINTENANCE_PERMISSIONS: ReadonlySet<string> = new Set([
  PERMISSIONS.SYSTEM_MANAGE,
  PERMISSIONS.SYSTEM_IMPORT,
  PERMISSIONS.SETTINGS_MANAGE,
  PERMISSIONS.SETTINGS_IMPORT,
  PERMISSIONS.SETTINGS_EXPORT,
]);

export function canAccessSystemMaintenance(payload: AuthLoginPayload): boolean {
  if (payload.roles.some((role) => role.name === AUTH_ROLE_NAMES.SUPER_ADMIN)) {
    return true;
  }
  return payload.permissions.some((p) => SYSTEM_MAINTENANCE_PERMISSIONS.has(p));
}
