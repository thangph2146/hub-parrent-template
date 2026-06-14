/**
 * Loader cho dữ liệu test fixture từ `hub-system-export-2026-06-11.json.gz`.
 *
 * File JSON này là kết quả export từ database production của `apps/main/api/`,
 * chứa các entity thực (role, user, post, category, tag, setting, pageContent,
 * session, contactRequest, notification, userRole, postTag, postCategory,
 * admissionResult, message, ...). Dùng để chạy integration test cho
 * `BaseUsersService` và các module khác mà không cần mock.
 *
 * @see apps/main/api/src/entities/ — schema entity gốc.
 */
import * as path from 'node:path';
import * as fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

/**
 * Đường dẫn tuyệt đối tới file fixture mặc định (gzip — ~3MB thay vì ~45MB JSON thuần).
 */
export const DEFAULT_FIXTURE_PATH = path.join(
  __dirname,
  'fixtures',
  'hub-system-export-2026-06-11.json.gz',
);

function readFixtureText(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  if (filePath.endsWith('.gz')) {
    return gunzipSync(buf).toString('utf-8');
  }
  return buf.toString('utf-8');
}

/**
 * Shape dữ liệu export - mỗi key là tên entity (snake_case), value là mảng bản ghi.
 * Khớp với schema của `apps/main/api/src/entities/*`.
 */
export interface FullExportFixture {
  settings: Array<Record<string, unknown>>;
  seo_meta: Array<Record<string, unknown>>;
  templates: Array<Record<string, unknown>>;
  training_levels: Array<Record<string, unknown>>;
  training_systems: Array<Record<string, unknown>>;
  academic_years: Array<Record<string, unknown>>;
  departments: Array<Record<string, unknown>>;
  majors: Array<Record<string, unknown>>;
  courses: Array<Record<string, unknown>>;
  locations: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  cameras: Array<Record<string, unknown>>;
  screens: Array<Record<string, unknown>>;
  face_data: Array<Record<string, unknown>>;
  speakers: Array<Record<string, unknown>>;
  imported_users: Array<Record<string, unknown>>;
  categories: Array<Record<string, unknown>>;
  tags: Array<Record<string, unknown>>;
  posts: Array<Record<string, unknown>>;
  comments: Array<Record<string, unknown>>;
  contact_requests: Array<Record<string, unknown>>;
  students: Array<Record<string, unknown>>;
  parent_students: Array<Record<string, unknown>>;
  groups: Array<Record<string, unknown>>;
  group_members: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  message_reads: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  page_contents: Array<Record<string, unknown>>;
  event_speakers: Array<Record<string, unknown>>;
  event_registrations: Array<Record<string, unknown>>;
  event_checkins: Array<Record<string, unknown>>;
  accounts: Array<Record<string, unknown>>;
  sessions: Array<Record<string, unknown>>;
  admission_results: Array<Record<string, unknown>>;
  customer_carts: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  post_categories: Array<Record<string, unknown>>;
  post_tags: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  promo_codes: Array<Record<string, unknown>>;
  roles: Array<Record<string, unknown>>;
  storage_files: Array<Record<string, unknown>>;
  user_roles: Array<Record<string, unknown>>;
  verification_tokens: Array<Record<string, unknown>>;
}

/**
 * Cache in-memory sau lần load đầu tiên - file 48MB, không muốn đọc lại nhiều lần.
 */
let cachedFixture: FullExportFixture | null = null;

/**
 * Load toàn bộ dữ liệu fixture từ file JSON.
 *
 * @param filePath - Đường dẫn tùy chỉnh; mặc định `DEFAULT_FIXTURE_PATH`.
 * @returns Fixture dạng object (đã cast sang `FullExportFixture`).
 */
export function loadFixture(
  filePath: string = DEFAULT_FIXTURE_PATH,
): FullExportFixture {
  if (cachedFixture && filePath === DEFAULT_FIXTURE_PATH) {
    return cachedFixture;
  }
  const raw = readFixtureText(filePath);
  const parsed = JSON.parse(raw) as FullExportFixture;
  if (filePath === DEFAULT_FIXTURE_PATH) {
    cachedFixture = parsed;
  }
  return parsed;
}

/**
 * Lấy danh sách user từ fixture.
 */
export function getUsers(
  fixture: FullExportFixture = loadFixture(),
): Array<Record<string, unknown>> {
  return fixture.users ?? [];
}

/**
 * Lấy danh sách role từ fixture.
 */
export function getRoles(
  fixture: FullExportFixture = loadFixture(),
): Array<Record<string, unknown>> {
  return fixture.roles ?? [];
}

/**
 * Lấy danh sách userRole (mapping user ↔ role) từ fixture.
 */
export function getUserRoles(
  fixture: FullExportFixture = loadFixture(),
): Array<Record<string, unknown>> {
  return fixture.user_roles ?? [];
}

/**
 * Lấy danh sách settings từ fixture.
 */
export function getSettings(
  fixture: FullExportFixture = loadFixture(),
): Array<Record<string, unknown>> {
  return fixture.settings ?? [];
}

/**
 * Lấy danh sách categories từ fixture.
 */
export function getCategories(
  fixture: FullExportFixture = loadFixture(),
): Array<Record<string, unknown>> {
  return fixture.categories ?? [];
}

/**
 * Tìm user đầu tiên có email khớp pattern.
 */
export function findUserByEmail(
  email: string,
  fixture: FullExportFixture = loadFixture(),
): Record<string, unknown> | undefined {
  return getUsers(fixture).find(
    (u) =>
      typeof u.email === 'string' &&
      u.email.toLowerCase() === email.toLowerCase(),
  );
}

/**
 * Tìm user theo id (chuỗi CUID).
 */
export function findUserById(
  id: string,
  fixture: FullExportFixture = loadFixture(),
): Record<string, unknown> | undefined {
  return getUsers(fixture).find((u) => u.id === id);
}

/**
 * Lấy tất cả userId của các role trong fixture.
 */
export function getUserIdsForRole(
  roleName: string,
  fixture: FullExportFixture = loadFixture(),
): string[] {
  const role = getRoles(fixture).find(
    (r) => typeof r.name === 'string' && r.name === roleName,
  );
  if (!role) return [];
  const roleId = role.id as string;
  return getUserRoles(fixture)
    .filter((ur) => ur.roleId === roleId)
    .map((ur) => ur.userId as string);
}

/**
 * Reset cache (dùng trong test khi cần load lại file khác).
 */
export function clearFixtureCache(): void {
  cachedFixture = null;
}
