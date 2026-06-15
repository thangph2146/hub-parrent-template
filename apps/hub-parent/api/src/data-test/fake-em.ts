/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * In-memory EntityManager cho integration test.
 *
 * Tạo một EntityManager giả lập (mockable) hoạt động trên dữ liệu từ
 * `data-test/fixtures/hub-system-export-2026-06-11.json.gz`. Mục đích: chạy được các
 * service method (findOne/find/persist/flush/count/getReference/nativeUpdate/
 * nativeDelete/remove) mà không cần database thật.
 *
 * Lưu ý: Đây là **in-memory simulation** - KHÔNG phải implementation đầy đủ
 * của MikroORM. Nó chỉ đủ logic để test các flow CRUD cơ bản trong
 * `BaseCrudService` và các base class khác.
 *
 * **Tính năng:**
 *   - Hỗ trợ **tất cả 46 entity** trong fixture (build store động từ
 *     `FullExportFixture` interface).
 *   - Tự động xác định target store dựa trên entity name (string) hoặc
 *     class name (constructor.name).
 *   - Hỗ trợ MikroORM operators: `$in`, `$ne`, `$like`, `$or`, nested object.
 *   - Populate join relations (vd: `user.userRoles[*].role`).
 *   - Order by, offset, limit, count.
 */

import type { FullExportFixture } from './fixture';

/**
 * Kết quả trả về của nativeUpdate/nativeDelete.
 */
export interface FakeUpdateResult {
  affected?: number;
}

/**
 * Snapshot in-memory của database. Mỗi entity là một map id -> entity object.
 *
 * Tên key = snake_case key trong FullExportFixture.
 */
export type FakeStore = Record<string, Map<string, Record<string, unknown>>>;

/**
 * Helper: chuyển tất cả fixture keys → store.
 *
 * Xử lý 2 trường hợp:
 *   1. Entity có `id` field (User, Post, Category, ...) → map theo id.
 *   2. Join table KHÔNG có `id` (post_categories, user_roles, ...) →
 *      tổng hợp id từ foreign keys: `postId:categoryId`.
 */
function buildStoreFromFixture(fixture: FullExportFixture): FakeStore {
  const store: FakeStore = {};
  let autoId = 1;
  for (const [entityName, rows] of Object.entries(fixture)) {
    if (!Array.isArray(rows)) continue;
    const map = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      let id = r.id;
      // Join table không có id → tổng hợp từ FK
      if (id === undefined || id === null) {
        // Common FK patterns (ưu tiên theo thứ tự)
        const fkKeys = Object.keys(r).filter(
          (k) => /Id[A-Z]?\b|Id$/.test(k) || k.endsWith('Id'),
        );
        if (fkKeys.length > 0) {
          // Sắp xếp FK keys ổn định
          fkKeys.sort();
          id = fkKeys.map((k) => String(r[k] ?? '')).join(':');
        } else {
          // Bỏ qua record không có id và không có FK (không thể truy vấn được)
          continue;
        }
      }
      // Gán auto id cho join table (vì query find({id: 1}) sẽ tìm theo synthetic id)
      if (r.id == null) {
        r.id = autoId++;
      }
      map.set(String(id), { ...r });
    }
    store[entityName] = map;
  }
  return store;
}

/**
 * Helper: snake_case từ PascalCase entity name.
 *   "User" → "users"
 *   "PostCategory" → "post_categories"
 *   "UserRole" → "user_roles"
 *   "TrainingLevel" → "training_levels"
 *   "AcademicYear" → "academic_years"
 *   "ParentStudent" → "parent_students"
 *   "ImportedUser" → "imported_users"
 *   "EventRegistration" → "event_registrations"
 *   "EventSpeaker" → "event_speakers"
 *   "EventCheckin" → "event_checkins"
 *   "PageContent" → "page_contents"
 *   "AdmittedResult" → "admission_results"
 *   "ContactRequest" → "contact_requests"
 *   "MessageRead" → "message_reads"
 *   "GroupMember" → "group_members"
 *   "VerificationToken" → "verification_tokens"
 *   "SeoMeta" → "seo_meta"
 *   "FaceData" → "face_data"
 *   "StorageFile" → "storage_files"
 *   "CustomerCart" → "customer_carts"
 *   "PromoCode" → "promo_codes"
 */
export function entityNameToStoreKey(entityName: string): string {
  // Insert "_" trước ký tự in hoa, rồi lowercase + "s"
  // Ví dụ: "PostCategory" → "post_category" → "post_categories"
  // Tuy nhiên "User" → "user" → "users"
  const snake = entityName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // userRole → user_Role
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // URLPath → URL_Path
    .toLowerCase();

  // Một số tên irregular cần map thủ công
  const irregular: Record<string, string> = {
    seo_meta: 'seo_meta',
    seo_metas: 'seo_meta',
    face_data: 'face_data',
    face_datas: 'face_data',
    storage_files: 'storage_files',
    customer_carts: 'customer_carts',
  };
  if (snake in irregular) return irregular[snake];

  // Plurialize đơn giản - tên entity trong fixture thường đã là số nhiều
  // nhưng có một số ngoại lệ cần map thủ công
  const pluralMap: Record<string, string> = {
    // Singular
    user: 'users',
    post: 'posts',
    tag: 'tags',
    category: 'categories',
    role: 'roles',
    event: 'events',
    screen: 'screens',
    speaker: 'speakers',
    course: 'courses',
    major: 'majors',
    camera: 'cameras',
    location: 'locations',
    template: 'templates',
    department: 'departments',
    setting: 'settings',
    product: 'products',
    order: 'orders',
    comment: 'comments',
    account: 'accounts',
    student: 'students',
    session: 'sessions',
    group: 'groups',
    group_member: 'group_members',
    message: 'messages',
    message_read: 'message_reads',
    notification: 'notifications',
    post_category: 'post_categories',
    post_tag: 'post_tags',
    user_role: 'user_roles',
    page_content: 'page_contents',
    parent_student: 'parent_students',
    imported_user: 'imported_users',
    academic_year: 'academic_years',
    training_level: 'training_levels',
    training_system: 'training_systems',
    event_speaker: 'event_speakers',
    event_registration: 'event_registrations',
    event_checkin: 'event_checkins',
    admission_result: 'admission_results',
    contact_request: 'contact_requests',
    verification_token: 'verification_tokens',
    promo_code: 'promo_codes',
    // Plural (entity name đã là số nhiều — giữ nguyên)
    users: 'users',
    posts: 'posts',
    tags: 'tags',
    categories: 'categories',
    roles: 'roles',
    events: 'events',
    screens: 'screens',
    speakers: 'speakers',
    courses: 'courses',
    majors: 'majors',
    cameras: 'cameras',
    locations: 'locations',
    templates: 'templates',
    departments: 'departments',
    settings: 'settings',
    products: 'products',
    orders: 'orders',
    comments: 'comments',
    accounts: 'accounts',
    students: 'students',
    sessions: 'sessions',
    groups: 'groups',
    group_members: 'group_members',
    messages: 'messages',
    message_reads: 'message_reads',
    notifications: 'notifications',
    post_categories: 'post_categories',
    post_tags: 'post_tags',
    user_roles: 'user_roles',
    page_contents: 'page_contents',
    parent_students: 'parent_students',
    imported_users: 'imported_users',
    academic_years: 'academic_years',
    training_levels: 'training_levels',
    training_systems: 'training_systems',
    event_speakers: 'event_speakers',
    event_registrations: 'event_registrations',
    event_checkins: 'event_checkins',
    admission_results: 'admission_results',
    contact_requests: 'contact_requests',
    verification_tokens: 'verification_tokens',
    promo_codes: 'promo_codes',
  };

  return pluralMap[snake] ?? `${snake}s`;
}

/**
 * Xác định tên store key từ entity (string, class, hoặc class name).
 */
function resolveStoreKey(entity: unknown, store: FakeStore): string | null {
  // 1) String trực tiếp
  if (typeof entity === 'string') {
    // Thử exact match trước (vd "users" → "users"), rồi PascalCase
    if (store[entity]) return entity;
    const key = entityNameToStoreKey(entity);
    if (store[key]) return key;
    return null;
  }
  // 2) Class constructor (lấy .name)
  if (typeof entity === 'function') {
    const className = (entity as { name?: string }).name;
    if (!className) return null;
    if (store[className]) return className;
    const key = entityNameToStoreKey(className);
    if (store[key]) return key;
    return null;
  }
  return null;
}

/**
 * Recursive filter match với MikroORM operators: $in, $ne, $like, $or, nested.
 */
function matchFilter(
  entity: Record<string, unknown>,
  filter: unknown,
): boolean {
  if (!filter || typeof filter !== 'object') return true;
  for (const [key, condition] of Object.entries(
    filter as Record<string, unknown>,
  )) {
    if (key === '$or' && Array.isArray(condition)) {
      if (!condition.some((sub) => matchFilter(entity, sub))) return false;
      continue;
    }
    if (key === '$and' && Array.isArray(condition)) {
      if (!condition.every((sub) => matchFilter(entity, sub))) return false;
      continue;
    }
    const value = entity[key];
    if (condition === null || condition === undefined) {
      if (value !== null && value !== undefined) return false;
      continue;
    }
    if (
      condition &&
      typeof condition === 'object' &&
      !Array.isArray(condition)
    ) {
      const condObj = condition as Record<string, unknown>;
      if ('$in' in condObj) {
        const arr = condObj.$in as unknown[];
        if (!arr.includes(value as never)) {
          // Special: id field có thể là number↔string
          if (
            key === 'id' &&
            (typeof value === 'string' || typeof value === 'number')
          ) {
            const numVal = Number(value);
            if (arr.some((x) => Number(x as never) === numVal)) continue;
          }
          return false;
        }
      } else if ('$ne' in condObj) {
        const neVal = condObj.$ne;
        if (neVal === null || neVal === undefined) {
          // Match any null/undefined (loại rows có value null/undefined)
          if (value === null || value === undefined) return false;
        } else {
          if (value === neVal) return false;
        }
      } else if ('$like' in condObj) {
        const pattern = String(condObj.$like).replace(/%/g, '');
        if (
          typeof value !== 'string' ||
          !value.toLowerCase().includes(pattern.toLowerCase())
        ) {
          return false;
        }
      } else if ('$gt' in condObj) {
        if (typeof value !== 'number' || !(value > Number(condObj.$gt)))
          return false;
      } else if ('$gte' in condObj) {
        if (typeof value !== 'number' || !(value >= Number(condObj.$gte)))
          return false;
      } else if ('$lt' in condObj) {
        if (typeof value !== 'number' || !(value < Number(condObj.$lt)))
          return false;
      } else if ('$lte' in condObj) {
        if (typeof value !== 'number' || !(value <= Number(condObj.$lte)))
          return false;
      } else if ('$null' in condObj) {
        const shouldBeNull = Boolean(condObj.$null);
        if (shouldBeNull && value !== null && value !== undefined) return false;
        if (!shouldBeNull && (value === null || value === undefined))
          return false;
      } else {
        // Nested object
        if (!value || typeof value !== 'object') return false;
        if (!matchFilter(value as Record<string, unknown>, condition)) {
          return false;
        }
      }
    } else {
      if (value !== condition) {
        // Special: id / *Id fields có thể là number↔string
        if (key === 'id' || key.endsWith('Id')) {
          const numValue = Number(value);
          const numCondition = Number(condition);
          if (
            !Number.isNaN(numValue) &&
            !Number.isNaN(numCondition) &&
            numValue === numCondition
          ) {
            continue;
          }
        }
        // Relation object: filter { event: 27 } khớp event: { id: 27 }
        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          typeof condition === 'number'
        ) {
          const objId = (value as { id?: unknown }).id;
          if (objId != null && Number(objId) === condition) continue;
        }
        // Relation shorthand: filter { event: 27 } khớp eventId trên row
        if (
          (value === undefined || value === null) &&
          typeof condition === 'number'
        ) {
          const fkKey = `${key}Id`;
          const fkValue = entity[fkKey];
          if (fkValue != null && Number(fkValue) === condition) continue;
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Populate relations cho 1 entity item.
 *
 * Hỗ trợ các populate paths:
 *   - `userRoles` — User → UserRole[] (1:N)
 *   - `userRoles.role` — User → UserRole[] → Role
 *   - `user` — UserRole → User
 *   - `role` — UserRole → Role
 *   - `parent` — ParentStudent → User (parent)
 *   - `student` — ParentStudent → User (student) hoặc Student entity
 *   - `category` — PostCategory → Category
 *   - `tag` — PostTag → Tag
 *   - `post` — PostCategory/PostTag → Post
 *   - `speaker` — EventSpeaker → Speaker
 *   - `event` — EventSpeaker/EventRegistration → Event
 *
 * Detect quan hệ dựa trên tên field trong entity và snake_case key trong store.
 */
function populateRelations(
  item: Record<string, unknown>,
  storeKey: string,
  populate: string[] | undefined,
  store: FakeStore,
): Record<string, unknown> {
  if (!populate || populate.length === 0) return { ...item };
  const copy: Record<string, unknown> = { ...item };

  for (const path of populate) {
    if (path === 'userRoles' && storeKey === 'users') {
      // User → UserRole[] (1:N, filter by userId)
      const userId = String(item.id);
      const userRoles = Array.from(store.user_roles?.values() ?? [])
        .filter((ur) => String(ur.userId) === userId)
        .map((ur) => ({ ...ur }));
      copy.userRoles = userRoles;
    } else if (path === 'userRoles.role' && storeKey === 'users') {
      // User → UserRole[] → Role
      const userId = String(item.id);
      const userRoles = Array.from(store.user_roles?.values() ?? [])
        .filter((ur) => String(ur.userId) === userId)
        .map((ur) => {
          const role = store.roles?.get(String(ur.roleId));
          return { ...ur, role: role ? { ...role } : null };
        });
      copy.userRoles = userRoles;
    } else if (path === 'user' && storeKey === 'user_roles') {
      const user = store.users?.get(String(item.userId));
      copy.user = user ? { ...user } : null;
    } else if (path === 'role' && storeKey === 'user_roles') {
      const role = store.roles?.get(String(item.roleId));
      copy.role = role ? { ...role } : null;
    } else if (path === 'parent' && storeKey === 'parent_students') {
      const parent = store.users?.get(String(item.parentId));
      copy.parent = parent ? { ...parent } : null;
    } else if (path === 'student' && storeKey === 'parent_students') {
      const student = store.users?.get(String(item.studentId));
      copy.student = student ? { ...student } : null;
    } else if (path === 'category' && storeKey === 'post_categories') {
      const category = store.categories?.get(String(item.categoryId));
      copy.category = category ? { ...category } : null;
    } else if (path === 'tag' && storeKey === 'post_tags') {
      const tag = store.tags?.get(String(item.tagId));
      copy.tag = tag ? { ...tag } : null;
    } else if (
      path === 'post' &&
      (storeKey === 'post_categories' || storeKey === 'post_tags')
    ) {
      const post = store.posts?.get(String(item.postId));
      copy.post = post ? { ...post } : null;
    } else if (path === 'speaker' && storeKey === 'event_speakers') {
      const speaker = store.speakers?.get(String(item.speakerId));
      copy.speaker = speaker ? { ...speaker } : null;
    } else if (
      path === 'event' &&
      (storeKey === 'event_speakers' ||
        storeKey === 'event_registrations' ||
        storeKey === 'event_checkins')
    ) {
      const event = store.events?.get(String(item.eventId));
      copy.event = event ? { ...event } : null;
    }
  }

  return copy;
}

/**
 * Order by: sort theo orderBy entries.
 */
function orderEntries(
  list: Record<string, unknown>[],
  orderBy: unknown,
): Record<string, unknown>[] {
  if (!orderBy || typeof orderBy !== 'object') return list;
  const entries = Object.entries(orderBy as Record<string, unknown>);
  if (entries.length === 0) return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
    for (const [k, dir] of entries) {
      const av = a[k];
      const bv = b[k];
      const cmp =
        av == null && bv == null
          ? 0
          : av == null
            ? 1
            : bv == null
              ? -1
              : av < bv
                ? -1
                : av > bv
                  ? 1
                  : 0;
      const sign = dir === 'DESC' ? -1 : 1;
      if (cmp !== 0) return cmp * sign;
    }
    return 0;
  });
  return sorted;
}

/**
 * Shape của fake EntityManager.
 */
export interface FakeEntityManager {
  findOne: jest.Mock;
  find: jest.Mock;
  count: jest.Mock;
  persist: jest.Mock;
  flush: jest.Mock;
  persistAndFlush: jest.Mock;
  remove: jest.Mock;
  removeAndFlush: jest.Mock;
  transactional: jest.Mock;
  isInTransaction: jest.Mock;
  getReference: jest.Mock;
  getRepository: jest.Mock;
  nativeUpdate: jest.Mock;
  nativeDelete: jest.Mock;
  // helpers (không có trong EM thật, chỉ dùng trong test)
  __store: FakeStore;
  __commit: () => void;
  __reset: () => void;
  /** Lấy tất cả bản ghi từ store (cho test assertion). */
  __all: (entity: unknown) => Array<Record<string, unknown>>;
}

/**
 * Tạo fake EntityManager với dữ liệu nạp từ fixture.
 *
 * Hỗ trợ TẤT CẢ 46 entity trong `FullExportFixture` (build store động).
 *
 * @param fixture - Dữ liệu export; nếu không truyền sẽ dùng loader mặc định.
 */
export function createFakeEntityManager(
  fixture: FullExportFixture,
): FakeEntityManager {
  const store: FakeStore = buildStoreFromFixture(fixture);

  const findOne: jest.Mock = jest.fn(
    (
      entity: unknown,
      filter: unknown,
      options?: { populate?: string[]; orderBy?: unknown },
    ): Record<string, unknown> | null => {
      const storeKey = resolveStoreKey(entity, store);
      if (!storeKey) return null;
      const map = store[storeKey];
      const items = Array.from(map.values());
      const ordered = orderEntries(items, options?.orderBy);
      for (const item of ordered) {
        if (matchFilter(item, filter)) {
          return populateRelations(item, storeKey, options?.populate, store);
        }
      }
      return null;
    },
  );

  const find: jest.Mock = jest.fn(
    (
      entity: unknown,
      filter: unknown,
      options?: {
        populate?: string[];
        orderBy?: unknown;
        offset?: number;
        limit?: number;
      },
    ): Record<string, unknown>[] => {
      const storeKey = resolveStoreKey(entity, store);
      if (!storeKey) return [];
      // 1) Populate FIRST so filter có thể reference populated fields
      const items = Array.from(store[storeKey].values()).map((it) =>
        populateRelations(it, storeKey, options?.populate, store),
      );
      // 2) Filter
      const filtered = items.filter((it) => matchFilter(it, filter));
      // 3) Order
      const ordered = orderEntries(filtered, options?.orderBy);
      // 4) Slice
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? ordered.length;
      return ordered.slice(offset, offset + limit);
    },
  );

  const count: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown): number => {
      return find(entity, filter).length;
    },
  );

  const persist: jest.Mock = jest.fn(
    (entity: Record<string, unknown> | Array<Record<string, unknown>>) => {
      const list = Array.isArray(entity) ? entity : [entity];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const id = item.id;
        if (id === undefined || id === null) continue;
        const idKey = String(id);
        let targetKey: string | null = null;
        const fieldSignature: Record<string, string[]> = {
          user_roles: ['userId', 'roleId'],
          post_categories: ['postId', 'categoryId'],
          post_tags: ['postId', 'tagId'],
          group_members: ['groupId', 'userId'],
          message_reads: ['messageId', 'userId'],
          event_speakers: ['eventId', 'speakerId'],
          event_registrations: ['eventId', 'email', 'fullName'],
          event_checkins: ['eventId', 'checkinTime'],
          parent_students: ['parentId', 'studentId'],
          admission_results: ['studentCode'],
          verification_tokens: ['token'],
          users: ['email', 'password', 'name'],
          roles: ['name', 'permissions'],
          posts: ['title', 'slug', 'excerpt'],
          categories: ['name', 'slug', 'parentId'],
          tags: ['name', 'slug'],
          comments: ['content', 'postId'],
          settings: ['key', 'value'],
          sessions: ['token', 'userId'],
          notifications: ['title', 'message'],
          messages: ['content', 'conversationId'],
          products: ['name', 'price', 'sku'],
          orders: ['orderNumber', 'totalAmount'],
          events: ['title', 'slug', 'startDate'],
          pages: ['slug', 'content'],
        };

        if (!targetKey) {
          const ctorName = (item as { constructor?: { name?: string } })
            .constructor?.name;
          if (ctorName) {
            const normalizedCtor = ctorName.trim();
            if (
              normalizedCtor &&
              normalizedCtor !== 'Object' &&
              normalizedCtor !== 'Array'
            ) {
              const key = entityNameToStoreKey(normalizedCtor);
              if (store[key]) targetKey = key;
            }
          }
        }

        if (!targetKey) {
          let bestKey: string | null = null;
          let bestScore = 0;
          for (const [storeKey, fields] of Object.entries(fieldSignature)) {
            if (!store[storeKey]) continue;
            const score = fields.reduce(
              (acc, f) => acc + (f in item ? 1 : 0),
              0,
            );
            if (score > bestScore) {
              bestScore = score;
              bestKey = storeKey;
            }
          }
          if (bestKey) {
            const required = Math.min(2, fieldSignature[bestKey]?.length ?? 0);
            if (bestScore >= required) targetKey = bestKey;
          }
        }

        if (!targetKey) {
          const matchedById: string[] = [];
          for (const key of Object.keys(store)) {
            if (store[key].has(idKey)) matchedById.push(key);
          }
          if (matchedById.length === 1) targetKey = matchedById[0] ?? null;
        }

        if (!targetKey) targetKey = 'users';
        store[targetKey].set(idKey, { ...item });
      }
      return Promise.resolve(undefined);
    },
  );

  const flush: jest.Mock = jest.fn(() => Promise.resolve(undefined));

  const persistAndFlush: jest.Mock = jest.fn(
    async (
      entity: Record<string, unknown> | Array<Record<string, unknown>>,
    ) => {
      await persist(entity);
      await flush();
    },
  );

  const remove: jest.Mock = jest.fn((entity: Record<string, unknown>) => {
    const id = entity.id as string;
    for (const key of Object.keys(store)) {
      if (store[key].has(id)) {
        store[key].delete(id);
        break;
      }
    }
    return Promise.resolve(undefined);
  });

  /**
   * Remove + flush trong 1 lần. Used by bulk-actions.ts for hard-delete.
   */
  const removeAndFlush: jest.Mock = jest.fn(
    (entities: Array<Record<string, unknown>> | Record<string, unknown>) => {
      const list = Array.isArray(entities) ? entities : [entities];
      for (const entity of list) {
        if (!entity || typeof entity !== 'object') continue;
        const id = entity.id;
        if (id === undefined || id === null) continue;
        const idKey = String(id);
        for (const key of Object.keys(store)) {
          if (store[key].has(idKey)) {
            store[key].delete(idKey);
            break;
          }
        }
      }
      return Promise.resolve(undefined);
    },
  );

  const transactional: jest.Mock = jest.fn(
    async (cb: (em: unknown) => Promise<unknown>) => {
      // In-memory: just run callback, no real transaction
      return await cb({
        find,
        findOne,
        count,
        persist,
        flush,
        persistAndFlush,
        remove,
        removeAndFlush,
        getReference,
        getRepository,
        nativeUpdate,
        nativeDelete,
      });
    },
  );

  const isInTransaction: jest.Mock = jest.fn(() => false);

  const getReference: jest.Mock = jest.fn(
    (_entity: unknown, id: string | number): Record<string, unknown> => {
      return { id };
    },
  );

  const getRepository: jest.Mock = jest.fn(() => ({
    find: jest.fn((filter: unknown) => {
      return find(null, filter) as never;
    }),
  }));

  const nativeUpdate: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown, update: Record<string, unknown>) => {
      const storeKey = resolveStoreKey(entity, store);
      if (!storeKey) return Promise.resolve(0);
      const map = store[storeKey];
      // Match và mutate TRỰC TIẾP trên reference trong map
      const matched: string[] = [];
      for (const [key, item] of map.entries()) {
        if (matchFilter(item, filter)) {
          Object.assign(item, update);
          matched.push(key);
        }
      }
      return Promise.resolve(matched.length);
    },
  );

  const nativeDelete: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown) => {
      const storeKey = resolveStoreKey(entity, store);
      if (!storeKey) return Promise.resolve(0);
      const map = store[storeKey];
      const matched: string[] = [];
      for (const [key, item] of map.entries()) {
        if (matchFilter(item, filter)) {
          matched.push(key);
        }
      }
      for (const key of matched) {
        map.delete(key);
      }
      return Promise.resolve(matched.length);
    },
  );

  const commit = () => {
    // No-op - flush already updates store
  };

  const reset = () => {
    const fresh = buildStoreFromFixture(fixture);
    for (const key of Object.keys(store)) store[key].clear();
    for (const [key, map] of Object.entries(fresh)) {
      for (const [id, val] of map.entries()) {
        store[key].set(id, val);
      }
    }
  };

  const all = (entity: unknown): Array<Record<string, unknown>> => {
    const storeKey = resolveStoreKey(entity, store);
    if (!storeKey) return [];
    return Array.from(store[storeKey].values()).map((it) => ({ ...it }));
  };

  return {
    findOne,
    find,
    count,
    persist,
    flush,
    persistAndFlush,
    remove,
    removeAndFlush,
    transactional,
    isInTransaction,
    getReference,
    getRepository,
    nativeUpdate,
    nativeDelete,
    __store: store,
    __commit: commit,
    __reset: reset,
    __all: all,
  };
}
