import { PERMISSIONS, type Permission } from './permissions';

export const PRODUCT_LINE_PROFILE = {
  id: 'main',
  label: 'Main API',
} as const;

export const ACTIVE_PERMISSION_RESOURCES: readonly string[] = [];

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
