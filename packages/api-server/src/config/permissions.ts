/**
 * Permission System Configuration.
 *
 * Bám sát pattern `apps/main/api/src/config/permissions.ts`.
 *
 * Defines resources, actions, and the full set of permissions for the API.
 * This should be kept in sync with the admin panel's permission definitions.
 */

// Resource types
export const RESOURCES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  POSTS: 'posts',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  COMMENTS: 'comments',
  ROLES: 'roles',
  MESSAGES: 'messages',
  GROUPS: 'groups',
  NOTIFICATIONS: 'notifications',
  CONTACT_REQUESTS: 'contact_requests',
  STUDENTS: 'students',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  ACCOUNTS: 'accounts',
  UPLOADS: 'uploads',
  ADMISSION_RESULTS: 'admission_results',
  PAGE_CONTENTS: 'page_contents',
  SEO_METAS: 'seo_metas',
  SPEAKERS: 'speakers',
  LOCATIONS: 'locations',
  TRAINING_LEVELS: 'training_levels',
  TRAINING_SYSTEMS: 'training_systems',
  MAJORS: 'majors',
  COURSES: 'courses',
  ACADEMIC_YEARS: 'academic_years',
  EVENTS: 'events',
  CAMERAS: 'cameras',
  TEMPLATES: 'templates',
  SCREENS: 'screens',
  DEPARTMENTS: 'departments',
  EVENT_REGISTRATIONS: 'event_registrations',
  EVENT_CHECKINS: 'event_checkins',
  EVENT_CHECKOUTS: 'event_checkouts',
  EVENT_SPEAKERS: 'event_speakers',
  FACE_DATA: 'face_data',
  IMPORTED_USERS: 'imported_users',
  SYSTEM: 'system',
  PARENT_STUDENTS: 'parent_students',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PROMO_CODES: 'promo_codes',
} as const;

// Action types
export const ACTIONS = {
  VIEW: 'view',
  VIEW_ALL: 'view_all',
  VIEW_OWN: 'view_own',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  APPROVE: 'approve',
  ASSIGN: 'assign',
  ACTIVE: 'active',
  MANAGE: 'manage',
  EXPORT: 'export',
  IMPORT: 'import',
  RESTORE: 'restore',
  HARD_DELETE: 'hard-delete',
  UNACTIVE: 'unactive',
  /** Thu hồi mọi phiên của một user (audit log; quyền API: sessions:manage). */
  REVOKE_BY_USER: 'revoke_by_user',
  CHECKOUT: 'checkout',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
export type Permission = `${Resource}:${Action}`;

/**
 * Helper function to generate standardized permissions for a resource.
 */
function generateResourcePermissions<T extends string>(resource: T) {
  const prefix = resource.toUpperCase() as Uppercase<T>;
  return {
    [`${prefix}_VIEW`]: `${resource}:${ACTIONS.VIEW}` as Permission,
    [`${prefix}_CREATE`]: `${resource}:${ACTIONS.CREATE}` as Permission,
    [`${prefix}_UPDATE`]: `${resource}:${ACTIONS.UPDATE}` as Permission,
    [`${prefix}_DELETE`]: `${resource}:${ACTIONS.DELETE}` as Permission,
    [`${prefix}_MANAGE`]: `${resource}:${ACTIONS.MANAGE}` as Permission,
    [`${prefix}_EXPORT`]: `${resource}:${ACTIONS.EXPORT}` as Permission,
  } as {
    [K in
      | 'VIEW'
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'MANAGE'
      | 'EXPORT' as `${Uppercase<T>}_${K}`]: Permission;
  };
}

// Centralized Permissions List
export const PERMISSIONS: Record<string, Permission> = {
  // Dashboard
  DASHBOARD_VIEW: `${RESOURCES.DASHBOARD}:${ACTIONS.VIEW}` as Permission,

  // Users
  ...generateResourcePermissions(RESOURCES.USERS),
  USERS_IMPORT: `${RESOURCES.USERS}:${ACTIONS.IMPORT}` as Permission,
  USERS_RESTORE: `${RESOURCES.USERS}:${ACTIONS.RESTORE}` as Permission,
  USERS_HARD_DELETE: `${RESOURCES.USERS}:${ACTIONS.HARD_DELETE}` as Permission,
  USERS_ACTIVE: `${RESOURCES.USERS}:${ACTIONS.ACTIVE}` as Permission,
  USERS_UNACTIVE: `${RESOURCES.USERS}:${ACTIONS.UNACTIVE}` as Permission,

  // Posts
  ...generateResourcePermissions(RESOURCES.POSTS),
  POSTS_VIEW_ALL: `${RESOURCES.POSTS}:${ACTIONS.VIEW_ALL}` as Permission,
  POSTS_VIEW_OWN: `${RESOURCES.POSTS}:${ACTIONS.VIEW_OWN}` as Permission,
  POSTS_PUBLISH: `${RESOURCES.POSTS}:${ACTIONS.PUBLISH}` as Permission,
  POSTS_IMPORT: `${RESOURCES.POSTS}:${ACTIONS.IMPORT}` as Permission,
  POSTS_RESTORE: `${RESOURCES.POSTS}:${ACTIONS.RESTORE}` as Permission,

  // Categories
  ...generateResourcePermissions(RESOURCES.CATEGORIES),
  CATEGORIES_RESTORE:
    `${RESOURCES.CATEGORIES}:${ACTIONS.RESTORE}` as Permission,
  CATEGORIES_HARD_DELETE:
    `${RESOURCES.CATEGORIES}:${ACTIONS.HARD_DELETE}` as Permission,

  // Tags
  ...generateResourcePermissions(RESOURCES.TAGS),
  TAGS_RESTORE: `${RESOURCES.TAGS}:${ACTIONS.RESTORE}` as Permission,

  // Comments
  ...generateResourcePermissions(RESOURCES.COMMENTS),
  COMMENTS_APPROVE: `${RESOURCES.COMMENTS}:${ACTIONS.APPROVE}` as Permission,
  COMMENTS_RESTORE: `${RESOURCES.COMMENTS}:${ACTIONS.RESTORE}` as Permission,

  // Roles
  ...generateResourcePermissions(RESOURCES.ROLES),
  ROLES_RESTORE: `${RESOURCES.ROLES}:${ACTIONS.RESTORE}` as Permission,

  // Messages
  ...generateResourcePermissions(RESOURCES.MESSAGES),
  MESSAGES_VIEW_OWN: `${RESOURCES.MESSAGES}:${ACTIONS.VIEW_OWN}` as Permission,

  // Groups
  ...generateResourcePermissions(RESOURCES.GROUPS),
  GROUPS_RESTORE: `${RESOURCES.GROUPS}:${ACTIONS.RESTORE}` as Permission,
  GROUPS_HARD_DELETE:
    `${RESOURCES.GROUPS}:${ACTIONS.HARD_DELETE}` as Permission,

  // Notifications
  NOTIFICATIONS_VIEW:
    `${RESOURCES.NOTIFICATIONS}:${ACTIONS.VIEW}` as Permission,
  NOTIFICATIONS_VIEW_ALL:
    `${RESOURCES.NOTIFICATIONS}:${ACTIONS.VIEW_ALL}` as Permission,
  NOTIFICATIONS_VIEW_OWN:
    `${RESOURCES.NOTIFICATIONS}:${ACTIONS.VIEW_OWN}` as Permission,
  NOTIFICATIONS_MANAGE:
    `${RESOURCES.NOTIFICATIONS}:${ACTIONS.MANAGE}` as Permission,
  NOTIFICATIONS_EXPORT:
    `${RESOURCES.NOTIFICATIONS}:${ACTIONS.EXPORT}` as Permission,

  // Contact Requests
  ...generateResourcePermissions(RESOURCES.CONTACT_REQUESTS),
  CONTACT_REQUESTS_ASSIGN:
    `${RESOURCES.CONTACT_REQUESTS}:${ACTIONS.ASSIGN}` as Permission,
  CONTACT_REQUESTS_RESTORE:
    `${RESOURCES.CONTACT_REQUESTS}:${ACTIONS.RESTORE}` as Permission,

  // Students
  ...generateResourcePermissions(RESOURCES.STUDENTS),
  STUDENTS_VIEW_ALL: `${RESOURCES.STUDENTS}:${ACTIONS.VIEW_ALL}` as Permission,
  STUDENTS_VIEW_OWN: `${RESOURCES.STUDENTS}:${ACTIONS.VIEW_OWN}` as Permission,
  STUDENTS_ACTIVE: `${RESOURCES.STUDENTS}:${ACTIONS.ACTIVE}` as Permission,
  STUDENTS_IMPORT: `${RESOURCES.STUDENTS}:${ACTIONS.IMPORT}` as Permission,
  STUDENTS_RESTORE: `${RESOURCES.STUDENTS}:${ACTIONS.RESTORE}` as Permission,

  // Sessions
  ...generateResourcePermissions(RESOURCES.SESSIONS),
  SESSIONS_RESTORE: `${RESOURCES.SESSIONS}:${ACTIONS.RESTORE}` as Permission,

  // Settings
  SETTINGS_VIEW: `${RESOURCES.SETTINGS}:${ACTIONS.VIEW}` as Permission,
  SETTINGS_CREATE: `${RESOURCES.SETTINGS}:${ACTIONS.CREATE}` as Permission,
  SETTINGS_UPDATE: `${RESOURCES.SETTINGS}:${ACTIONS.UPDATE}` as Permission,
  SETTINGS_DELETE: `${RESOURCES.SETTINGS}:${ACTIONS.DELETE}` as Permission,
  SETTINGS_MANAGE: `${RESOURCES.SETTINGS}:${ACTIONS.MANAGE}` as Permission,
  SETTINGS_EXPORT: `${RESOURCES.SETTINGS}:${ACTIONS.EXPORT}` as Permission,
  SETTINGS_IMPORT: `${RESOURCES.SETTINGS}:${ACTIONS.IMPORT}` as Permission,

  // Accounts
  ACCOUNTS_VIEW: `${RESOURCES.ACCOUNTS}:${ACTIONS.VIEW}` as Permission,
  ACCOUNTS_UPDATE: `${RESOURCES.ACCOUNTS}:${ACTIONS.UPDATE}` as Permission,
  ACCOUNTS_MANAGE: `${RESOURCES.ACCOUNTS}:${ACTIONS.MANAGE}` as Permission,

  // Uploads
  ...generateResourcePermissions(RESOURCES.UPLOADS),

  // Admission Results
  ...generateResourcePermissions(RESOURCES.ADMISSION_RESULTS),
  ADMISSION_RESULTS_IMPORT:
    `${RESOURCES.ADMISSION_RESULTS}:${ACTIONS.IMPORT}` as Permission,
  ADMISSION_RESULTS_RESTORE:
    `${RESOURCES.ADMISSION_RESULTS}:${ACTIONS.RESTORE}` as Permission,

  // Page Contents
  PAGE_CONTENTS_VIEW:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.VIEW}` as Permission,
  PAGE_CONTENTS_CREATE:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.CREATE}` as Permission,
  PAGE_CONTENTS_UPDATE:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.UPDATE}` as Permission,
  PAGE_CONTENTS_DELETE:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.DELETE}` as Permission,
  PAGE_CONTENTS_MANAGE:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.MANAGE}` as Permission,
  PAGE_CONTENTS_EXPORT:
    `${RESOURCES.PAGE_CONTENTS}:${ACTIONS.EXPORT}` as Permission,

  // SEO Metas
  ...generateResourcePermissions(RESOURCES.SEO_METAS),
  SEO_METAS_RESTORE: `${RESOURCES.SEO_METAS}:${ACTIONS.RESTORE}` as Permission,
  SEO_METAS_HARD_DELETE:
    `${RESOURCES.SEO_METAS}:${ACTIONS.HARD_DELETE}` as Permission,

  // Speakers
  ...generateResourcePermissions(RESOURCES.SPEAKERS),
  SPEAKERS_RESTORE: `${RESOURCES.SPEAKERS}:${ACTIONS.RESTORE}` as Permission,

  // Locations
  ...generateResourcePermissions(RESOURCES.LOCATIONS),
  LOCATIONS_RESTORE: `${RESOURCES.LOCATIONS}:${ACTIONS.RESTORE}` as Permission,

  // Training Levels
  ...generateResourcePermissions(RESOURCES.TRAINING_LEVELS),
  TRAINING_LEVELS_RESTORE:
    `${RESOURCES.TRAINING_LEVELS}:${ACTIONS.RESTORE}` as Permission,

  // Training Systems
  ...generateResourcePermissions(RESOURCES.TRAINING_SYSTEMS),
  TRAINING_SYSTEMS_RESTORE:
    `${RESOURCES.TRAINING_SYSTEMS}:${ACTIONS.RESTORE}` as Permission,

  // Majors
  ...generateResourcePermissions(RESOURCES.MAJORS),
  MAJORS_RESTORE: `${RESOURCES.MAJORS}:${ACTIONS.RESTORE}` as Permission,

  // Courses
  ...generateResourcePermissions(RESOURCES.COURSES),
  COURSES_RESTORE: `${RESOURCES.COURSES}:${ACTIONS.RESTORE}` as Permission,

  // Academic Years
  ...generateResourcePermissions(RESOURCES.ACADEMIC_YEARS),
  ACADEMIC_YEARS_RESTORE:
    `${RESOURCES.ACADEMIC_YEARS}:${ACTIONS.RESTORE}` as Permission,

  // Events
  ...generateResourcePermissions(RESOURCES.EVENTS),
  EVENTS_RESTORE: `${RESOURCES.EVENTS}:${ACTIONS.RESTORE}` as Permission,

  // Cameras
  ...generateResourcePermissions(RESOURCES.CAMERAS),
  CAMERAS_RESTORE: `${RESOURCES.CAMERAS}:${ACTIONS.RESTORE}` as Permission,

  // Templates
  ...generateResourcePermissions(RESOURCES.TEMPLATES),
  TEMPLATES_RESTORE: `${RESOURCES.TEMPLATES}:${ACTIONS.RESTORE}` as Permission,

  // Screens
  ...generateResourcePermissions(RESOURCES.SCREENS),
  SCREENS_RESTORE: `${RESOURCES.SCREENS}:${ACTIONS.RESTORE}` as Permission,

  // Departments
  ...generateResourcePermissions(RESOURCES.DEPARTMENTS),
  DEPARTMENTS_RESTORE:
    `${RESOURCES.DEPARTMENTS}:${ACTIONS.RESTORE}` as Permission,

  // Event Registrations
  ...generateResourcePermissions(RESOURCES.EVENT_REGISTRATIONS),
  EVENT_REGISTRATIONS_RESTORE:
    `${RESOURCES.EVENT_REGISTRATIONS}:${ACTIONS.RESTORE}` as Permission,
  EVENT_REGISTRATIONS_HARD_DELETE:
    `${RESOURCES.EVENT_REGISTRATIONS}:${ACTIONS.HARD_DELETE}` as Permission,

  // Event Checkins
  ...generateResourcePermissions(RESOURCES.EVENT_CHECKINS),
  EVENT_CHECKINS_RESTORE:
    `${RESOURCES.EVENT_CHECKINS}:${ACTIONS.RESTORE}` as Permission,
  EVENT_CHECKINS_HARD_DELETE:
    `${RESOURCES.EVENT_CHECKINS}:${ACTIONS.HARD_DELETE}` as Permission,

  // Event Checkouts
  ...generateResourcePermissions(RESOURCES.EVENT_CHECKOUTS),

  // Event Speakers
  ...generateResourcePermissions(RESOURCES.EVENT_SPEAKERS),

  // Face Data
  ...generateResourcePermissions(RESOURCES.FACE_DATA),
  FACE_DATA_RESTORE: `${RESOURCES.FACE_DATA}:${ACTIONS.RESTORE}` as Permission,
  FACE_DATA_HARD_DELETE:
    `${RESOURCES.FACE_DATA}:${ACTIONS.HARD_DELETE}` as Permission,

  // Imported Users
  ...generateResourcePermissions(RESOURCES.IMPORTED_USERS),
  IMPORTED_USERS_RESTORE:
    `${RESOURCES.IMPORTED_USERS}:${ACTIONS.RESTORE}` as Permission,

  // System (sao lưu, import, database-schema, ...)
  ...generateResourcePermissions(RESOURCES.SYSTEM),
  SYSTEM_IMPORT: `${RESOURCES.SYSTEM}:${ACTIONS.IMPORT}` as Permission,

  // Parent Students (duyệt yêu cầu liên kết phụ huynh–sinh viên)
  ...generateResourcePermissions(RESOURCES.PARENT_STUDENTS),

  // Products (catalog storefront)
  ...generateResourcePermissions(RESOURCES.PRODUCTS),
  PRODUCTS_RESTORE: `${RESOURCES.PRODUCTS}:${ACTIONS.RESTORE}` as Permission,

  // Orders (checkout + quản lý đơn)
  ...generateResourcePermissions(RESOURCES.ORDERS),
  ORDERS_CHECKOUT: `${RESOURCES.ORDERS}:${ACTIONS.CHECKOUT}` as Permission,

  ...generateResourcePermissions(RESOURCES.PROMO_CODES),
} as const;
