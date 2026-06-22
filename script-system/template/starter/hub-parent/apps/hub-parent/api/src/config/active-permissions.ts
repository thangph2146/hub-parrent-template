/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { PERMISSIONS, type Permission } from './permissions';

export const PRODUCT_LINE_PROFILE = {
  "id": "hub-parent",
  "label": "HUB Parent"
} as const;

export const ACTIVE_PERMISSION_RESOURCES = [
  "dashboard",
  "users",
  "roles",
  "sessions",
  "accounts",
  "settings",
  "uploads",
  "categories",
  "tags",
  "page_contents",
  "posts",
  "seo_metas",
  "contact_requests",
  "parent_students",
  "students",
  "notifications",
  "system"
] as const;

export const ACTIVE_ROLE_PRESETS = [
  "super_admin",
  "admin",
  "manager",
  "editor",
  "support_staff",
  "parent",
  "student"
] as const;

const ACTIVE_PERMISSION_RESOURCE_SET = new Set<string>(ACTIVE_PERMISSION_RESOURCES);

export const ACTIVE_PERMISSIONS: Permission[] = Object.values(PERMISSIONS).filter(
  (permission) => {
    const [resource] = permission.split(':');
    return resource ? ACTIVE_PERMISSION_RESOURCE_SET.has(resource) : false;
  },
);
