import {
  EVENT_CHECKIN_STAFF_PERMISSIONS,
  EVENT_STAFF_ROLE_TEMPLATE,
} from '../config/role-templates/event-staff.template';
import { type Permission } from '../config/permissions';
import {
  ACTIVE_PERMISSIONS,
  ACTIVE_ROLE_PRESETS,
} from '../config/active-permissions';

// Role data — mật khẩu plain `demo` (chỉ local / seed dev).
export const DEV_LOGIN_PASSWORD_PLAIN = 'demo';

export const DEV_LOGIN_PASSWORD_HASH =
  '$2b$10$6gktuaAnT51RIaAhhkRozOYZpg664aG.B03tp/VQ0x7BlOVgXbE1y';

export { EVENT_CHECKIN_STAFF_PERMISSIONS, EVENT_STAFF_ROLE_TEMPLATE };

const ACTIVE_PERMISSION_SET = new Set<Permission>(ACTIVE_PERMISSIONS);
const ACTIVE_ROLE_PRESET_SET = new Set<string>(ACTIVE_ROLE_PRESETS);
const ALL_PERMISSIONS = ACTIVE_PERMISSIONS;

function uniquePermissions(
  ...groups: ReadonlyArray<readonly Permission[]>
): Permission[] {
  return [...new Set(groups.flat())];
}

function pickPermissionsByResource(
  ...resources: ReadonlyArray<string>
): Permission[] {
  const allowed = new Set(resources);
  return ALL_PERMISSIONS.filter((permission) => {
    const [resource] = permission.split(':');
    return allowed.has(resource);
  });
}

function pickPermissionsByCode(
  ...permissions: ReadonlyArray<Permission>
): Permission[] {
  const allowed = new Set(permissions);
  return ALL_PERMISSIONS.filter((permission) => allowed.has(permission));
}

function excludePermissionCodes(
  permissions: readonly Permission[],
  ...blocked: ReadonlyArray<Permission>
): Permission[] {
  const blockedSet = new Set(blocked);
  return permissions.filter((permission) => !blockedSet.has(permission));
}

const SELF_SERVICE_PERMISSIONS = pickPermissionsByCode(
  'dashboard:view',
  'accounts:view',
  'accounts:update',
);

const STAFF_DIRECTORY_PERMISSIONS = pickPermissionsByResource('users', 'sessions');

const RBAC_READ_PERMISSIONS = pickPermissionsByCode('roles:view', 'roles:export');

const CONTENT_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'posts',
  'categories',
  'tags',
  'comments',
  'page_contents',
  'seo_metas',
  'uploads',
);

const COMMUNICATION_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'contact_requests',
  'groups',
  'messages',
  'notifications',
);

const ACADEMIC_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'students',
  'parent_students',
  'admission_results',
  'imported_users',
  'training_levels',
  'training_systems',
  'majors',
  'courses',
  'academic_years',
  'departments',
);

const EVENT_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'events',
  'event_registrations',
  'event_checkins',
  'event_checkouts',
  'event_speakers',
  'speakers',
  'locations',
  'cameras',
  'templates',
  'screens',
  'face_data',
);

const STORE_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'products',
  'orders',
  'promo_codes',
);

const SYSTEM_OPERATIONS_PERMISSIONS = pickPermissionsByResource(
  'settings',
  'system',
);

const ADMIN_PERMISSIONS = excludePermissionCodes(
  uniquePermissions(
    SELF_SERVICE_PERMISSIONS,
    STAFF_DIRECTORY_PERMISSIONS,
    RBAC_READ_PERMISSIONS,
    CONTENT_OPERATIONS_PERMISSIONS,
    COMMUNICATION_OPERATIONS_PERMISSIONS,
    ACADEMIC_OPERATIONS_PERMISSIONS,
    EVENT_OPERATIONS_PERMISSIONS,
    STORE_OPERATIONS_PERMISSIONS,
    SYSTEM_OPERATIONS_PERMISSIONS,
  ),
  'users:hard-delete',
  'roles:delete',
  'roles:manage',
  'roles:restore',
  'system:delete',
);

const MANAGER_PERMISSIONS = excludePermissionCodes(
  uniquePermissions(
    SELF_SERVICE_PERMISSIONS,
    pickPermissionsByCode('users:view', 'users:export'),
    CONTENT_OPERATIONS_PERMISSIONS,
    COMMUNICATION_OPERATIONS_PERMISSIONS,
    ACADEMIC_OPERATIONS_PERMISSIONS,
    EVENT_OPERATIONS_PERMISSIONS,
    STORE_OPERATIONS_PERMISSIONS,
    pickPermissionsByCode('settings:view', 'settings:update', 'settings:export'),
  ),
  'comments:approve',
  'users:delete',
  'users:hard-delete',
  'students:delete',
  'parent_students:delete',
  'system:delete',
  'face_data:hard-delete',
  'event_registrations:hard-delete',
  'event_checkins:hard-delete',
  'seo_metas:hard-delete',
  'categories:hard-delete',
  'groups:hard-delete',
);

const EDITOR_PERMISSIONS = uniquePermissions(
  SELF_SERVICE_PERMISSIONS,
  CONTENT_OPERATIONS_PERMISSIONS,
  pickPermissionsByResource('contact_requests'),
);

const SALES_PERMISSIONS = uniquePermissions(
  SELF_SERVICE_PERMISSIONS,
  pickPermissionsByCode('users:view'),
  pickPermissionsByResource('products', 'orders', 'promo_codes', 'contact_requests'),
);

const SHIPPER_PERMISSIONS = uniquePermissions(
  SELF_SERVICE_PERMISSIONS,
  pickPermissionsByCode(
    'orders:view',
    'orders:update',
    'orders:export',
    'products:view',
    'contact_requests:view',
  ),
);

const PARENT_PERMISSIONS = pickPermissionsByCode(
  'dashboard:view',
  'parent_students:view',
  'parent_students:create',
  'notifications:view_own',
  'messages:view_own',
  'posts:view',
  'accounts:view',
  'accounts:update',
);

const STUDENT_PERMISSIONS = pickPermissionsByCode(
  'dashboard:view',
  'students:view_own',
  'notifications:view_own',
  'messages:view_own',
  'posts:view',
  'accounts:view',
  'accounts:update',
);

const SUPERADMIN_ROLES_DATA_BASE = [
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: '',
    permissions: [
      'accounts:update',
      'accounts:manage',
      'accounts:view',
      'admission_results:update',
      'admission_results:export',
      'admission_results:import',
      'admission_results:manage',
      'admission_results:restore',
      'admission_results:create',
      'admission_results:view',
      'admission_results:delete',
      'posts:update',
      'posts:export',
      'posts:import',
      'posts:manage',
      'posts:restore',
      'posts:create',
      'posts:view_all',
      'posts:view_own',
      'posts:view',
      'posts:delete',
      'posts:publish',
      'comments:update',
      'comments:approve',
      'comments:export',
      'comments:manage',
      'comments:restore',
      'comments:create',
      'comments:view',
      'comments:delete',
      'settings:update',
      'settings:export',
      'settings:manage',
      'settings:create',
      'settings:view',
      'settings:delete',
      'categories:update',
      'categories:export',
      'categories:manage',
      'categories:create',
      'categories:view',
      'categories:delete',
      'categories:restore',
      'categories:hard-delete',
      'dashboard:view',
      'groups:update',
      'groups:export',
      'groups:manage',
      'groups:create',
      'groups:view',
      'groups:delete',
      'groups:restore',
      'groups:hard-delete',
      'contact_requests:update',
      'contact_requests:export',
      'contact_requests:assign',
      'contact_requests:manage',
      'contact_requests:restore',
      'contact_requests:create',
      'contact_requests:view',
      'contact_requests:delete',
      'users:active',
      'users:update',
      'users:export',
      'users:hard-delete',
      'users:import',
      'users:manage',
      'users:restore',
      'users:create',
      'users:unactive',
      'users:view',
      'users:delete',
      'page_contents:update',
      'page_contents:export',
      'page_contents:manage',
      'page_contents:create',
      'page_contents:view',
      'page_contents:delete',
      'sessions:update',
      'sessions:export',
      'sessions:manage',
      'sessions:restore',
      'sessions:revoke-by-user',
      'sessions:create',
      'sessions:view',
      'sessions:delete',
      'students:active',
      'students:update',
      'students:export',
      'students:import',
      'students:manage',
      'students:restore',
      'students:create',
      'students:view_all',
      'students:view_own',
      'students:view',
      'students:delete',
      'tags:update',
      'tags:export',
      'tags:manage',
      'tags:restore',
      'tags:create',
      'tags:view',
      'tags:delete',
      'notifications:export',
      'notifications:manage',
      'notifications:view_all',
      'notifications:view_own',
      'notifications:view',
      'messages:update',
      'messages:export',
      'messages:manage',
      'messages:create',
      'messages:view',
      'messages:delete',
      'uploads:update',
      'uploads:export',
      'uploads:manage',
      'uploads:create',
      'uploads:view',
      'uploads:delete',
      'roles:update',
      'roles:export',
      'roles:manage',
      'roles:create',
      'roles:view',
      'roles:delete',
      'roles:restore',
      'imported_users:view',
      'imported_users:create',
      'imported_users:update',
      'imported_users:delete',
      'imported_users:manage',
      'imported_users:export',
      'imported_users:restore',
      'system:view',
      'system:create',
      'system:update',
      'system:delete',
      'system:manage',
      'system:export',
      'system:import',
      'parent_students:view',
      'parent_students:create',
      'parent_students:update',
      'parent_students:delete',
      'parent_students:manage',
      'parent_students:export',
      'products:view',
      'products:create',
      'products:update',
      'products:delete',
      'products:manage',
      'products:export',
      'products:restore',
      'orders:view',
      'orders:create',
      'orders:update',
      'orders:delete',
      'orders:manage',
      'orders:export',
      'orders:checkout',
      'promo_codes:view',
      'promo_codes:create',
      'promo_codes:update',
      'promo_codes:delete',
      'promo_codes:manage',
      'promo_codes:export',
    ],
    isActive: true,
  },
  {
    name: 'admin',
    displayName: 'Admin',
    description: null,
    permissions: [
      'dashboard:view',
      'posts:view',
      'posts:view_all',
      'posts:view_own',
      'posts:create',
      'posts:update',
      'posts:delete',
      'posts:publish',
      'posts:manage',
      'categories:view',
      'categories:create',
      'categories:update',
      'categories:delete',
      'categories:restore',
      'categories:hard-delete',
      'categories:manage',
      'users:view',
      'users:create',
      'users:update',
      'users:delete',
      'users:manage',
      'notifications:view',
      'notifications:view_all',
      'notifications:view_own',
      'notifications:manage',
      'contact_requests:view',
      'contact_requests:create',
      'contact_requests:assign',
      'contact_requests:update',
      'contact_requests:delete',
      'contact_requests:manage',
      'accounts:view',
      'accounts:update',
      'sessions:view',
      'sessions:create',
      'sessions:update',
      'sessions:delete',
      'sessions:manage',
      'uploads:view',
      'uploads:create',
      'uploads:delete',
      'uploads:manage',
      'admission_results:view',
      'admission_results:create',
      'admission_results:update',
      'admission_results:delete',
      'admission_results:manage',
      'page_contents:view',
      'page_contents:create',
      'page_contents:update',
      'page_contents:delete',
      'page_contents:manage',
      'groups:view',
      'groups:create',
      'groups:update',
      'groups:delete',
      'groups:restore',
      'groups:hard-delete',
      'groups:manage',
      'settings:view',
      'settings:manage',
      'settings:import',
      'settings:export',
      'settings:update',
      'products:view',
      'products:create',
      'products:update',
      'products:delete',
      'products:manage',
      'orders:view',
      'orders:update',
      'orders:manage',
      'orders:checkout',
      'promo_codes:view',
      'promo_codes:create',
      'promo_codes:update',
      'promo_codes:manage',
    ],
    isActive: true,
  },
  {
    name: 'editor',
    displayName: 'Editor',
    description: '',
    permissions: [
      'posts:view',
      'posts:create',
      'posts:update',
      'posts:delete',
      'posts:export',
      'posts:import',
      'posts:manage',
      'posts:publish',
      'posts:restore',
      'posts:view_all',
      'posts:view_own',
      'accounts:view',
      'accounts:update',
      'accounts:manage',
      'dashboard:view',
      'uploads:view',
      'uploads:create',
      'uploads:update',
      'uploads:delete',
      'uploads:export',
      'uploads:manage',
      'categories:view',
      'categories:create',
      'categories:update',
      'categories:delete',
      'categories:restore',
      'categories:hard-delete',
      'categories:export',
      'categories:manage',
      'tags:view',
      'tags:create',
      'tags:update',
      'tags:delete',
      'tags:export',
      'tags:manage',
      'contact_requests:view',
      'contact_requests:create',
      'contact_requests:update',
      'contact_requests:delete',
      'contact_requests:assign',
      'contact_requests:export',
      'contact_requests:manage',
      'contact_requests:restore',
      'page_contents:view',
      'page_contents:create',
      'page_contents:update',
      'page_contents:delete',
      'page_contents:export',
      'page_contents:manage',
    ],
    isActive: true,
  },
  {
    name: 'user',
    displayName: 'User',
    description: null,
    permissions: null,
    isActive: true,
  },
  {
    name: 'parent',
    displayName: 'Phụ huynh',
    description: 'Tài khoản phụ huynh — liên kết và theo dõi học sinh',
    permissions: [
      'dashboard:view',
      'parent_students:view',
      'parent_students:create',
      'notifications:view_own',
      'messages:view_own',
      'posts:view',
      'accounts:view',
      'accounts:update',
    ],
    isActive: true,
  },
  {
    name: 'student',
    displayName: 'Sinh viên',
    description:
      'Tài khoản sinh viên — xem thông tin cá nhân, thông báo và bài viết',
    permissions: [
      'dashboard:view',
      'students:view_own',
      'notifications:view_own',
      'messages:view_own',
      'posts:view',
      'accounts:view',
      'accounts:update',
    ],
    isActive: true,
  },
  { ...EVENT_STAFF_ROLE_TEMPLATE },
];

const ROLE_PERMISSION_OVERRIDES = {
  super_admin: {
    description:
      'Toàn quyền hệ thống — tự động bao phủ toàn bộ catalog permission hiện tại',
    permissions: ALL_PERMISSIONS,
  },
  admin: {
    description:
      'Quản trị vận hành — đủ quyền nghiệp vụ, hạn chế thao tác phá hủy cấp hệ thống/RBAC',
    permissions: ADMIN_PERMISSIONS,
  },
  editor: {
    description:
      'Biên tập nội dung — bài viết, trang nội dung, SEO, danh mục, media và liên hệ',
    permissions: EDITOR_PERMISSIONS,
  },
  parent: {
    permissions: PARENT_PERMISSIONS,
  },
  student: {
    permissions: STUDENT_PERMISSIONS,
  },
} as const;

const ADDITIONAL_ROLE_TEMPLATES = [
  {
    name: 'manager',
    displayName: 'Quản lý vận hành',
    description:
      'Quản lý nội dung, học vụ, sự kiện và thương mại; không có quyền RBAC nhạy cảm',
    permissions: MANAGER_PERMISSIONS,
    isActive: true,
  },
  {
    name: 'sales',
    displayName: 'Kinh doanh',
    description:
      'Vận hành sản phẩm, đơn hàng, mã khuyến mãi và liên hệ khách hàng',
    permissions: SALES_PERMISSIONS,
    isActive: true,
  },
  {
    name: 'shipper',
    displayName: 'Giao vận',
    description: 'Theo dõi và cập nhật đơn hàng được giao',
    permissions: SHIPPER_PERMISSIONS,
    isActive: true,
  },
] as const;

export const SUPERADMIN_ROLES_DATA = [
  ...SUPERADMIN_ROLES_DATA_BASE.map((role) => ({
    ...role,
    ...(ROLE_PERMISSION_OVERRIDES[
      role.name as keyof typeof ROLE_PERMISSION_OVERRIDES
    ] ?? {}),
  })),
  ...ADDITIONAL_ROLE_TEMPLATES,
]
  .filter((role) => ACTIVE_ROLE_PRESET_SET.has(role.name))
  .map((role) => ({
    ...role,
    permissions: (role.permissions ?? []).filter((permission) =>
      ACTIVE_PERMISSION_SET.has(permission),
    ),
  }));

// User data
export const SUPERADMIN_USERS_DATA = [
  {
    email: 'superadmin@hub.edu.vn',
    name: 'Super Administrator',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
  {
    email: 'admin@hub.edu.vn',
    name: 'Administrator',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
  {
    email: 'lamvtt@hub.edu.vn',
    name: 'Thanh Lâm',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: '',
    avatar: null,
    emailVerified: null,
    phone: '',
    address: null,
    isActive: true,
  },
  {
    email: 'thang.ph2146@gmail.com',
    name: 'Thắng Phạm',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: '',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocLhicj6TqxKzF0hVnmJ5OueMMe-zdEgZT_U9b3iIzjTQP3ZerqO=s96-c',
    emailVerified: null,
    phone: '',
    address: null,
    isActive: true,
  },
  {
    email: 'thangph@hub.edu.vn',
    name: 'Thang Pham Hoang',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: '',
    avatar:
      'https://lh3.googleusercontent.com/a/ACg8ocK8ybfPbsmaejqRrCM1q1hKxnsAi5KclkMWiMmEdb3Q2KveHw=s96-c',
    emailVerified: null,
    phone: '',
    address: null,
    isActive: true,
  },
  {
    email: 'student@hub.edu.vn',
    name: 'Nguyễn Văn A',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: '0123456789',
    address: 'Khu phố 6, Thủ Đức, TP.HCM',
    isActive: true,
  },
  {
    email: 'demo.sv@st.buh.edu.vn',
    name: 'Sinh viên demo (check-in)',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
  {
    email: 'demo.phuhuynh@hub.edu.vn',
    name: 'Phụ huynh demo (check-in)',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
  {
    email: 'demo.khach@hub.edu.vn',
    name: 'Khách demo (check-in)',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: null,
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
  {
    email: 'btc.checkin@hub.edu.vn',
    name: 'BTC Check-in (demo)',
    password: DEV_LOGIN_PASSWORD_HASH,
    bio: 'Ban tổ chức (BTC) — cổng /admin, role event_staff',
    avatar: null,
    emailVerified: null,
    phone: null,
    address: null,
    isActive: true,
  },
];

// UserRole data
export const SUPERADMIN_USER_ROLES_DATA = [
  { userEmail: 'superadmin@hub.edu.vn', roleName: 'super_admin' },
  { userEmail: 'admin@hub.edu.vn', roleName: 'admin' },
  { userEmail: 'lamvtt@hub.edu.vn', roleName: 'editor' },
  { userEmail: 'thang.ph2146@gmail.com', roleName: 'editor' },
  { userEmail: 'thangph@hub.edu.vn', roleName: 'editor' },
  { userEmail: 'student@hub.edu.vn', roleName: 'student' },
  { userEmail: 'demo.sv@st.buh.edu.vn', roleName: 'student' },
  { userEmail: 'demo.phuhuynh@hub.edu.vn', roleName: 'parent' },
  { userEmail: 'demo.khach@hub.edu.vn', roleName: 'user' },
  { userEmail: 'btc.checkin@hub.edu.vn', roleName: 'event_staff' },
];
