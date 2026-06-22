import { PERMISSIONS, type Permission } from './permissions';

export const PRODUCT_LINE_PROFILE = {
  id: 'main',
  label: 'Main API',
} as const;

export const ACTIVE_PERMISSION_RESOURCES: readonly string[] = [];

export const ACTIVE_END_USER_PERMISSION_CODES: readonly string[] = [];

export const ACTIVE_ROLE_PRESETS: readonly string[] = [
  'super_admin',
  'admin',
  'manager',
  'editor',
  'event_staff',
  'sales',
  'shipper',
  'support_staff',
  'parent',
  'student',
];

export const ACTIVE_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const ACTIVE_PERMISSION_SET = new Set<string>(ACTIVE_PERMISSIONS);

export function parseRolePermissions(input: unknown): string[] {
  let raw = input;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (permission): permission is string =>
      typeof permission === 'string' && ACTIVE_PERMISSION_SET.has(permission),
  );
}
