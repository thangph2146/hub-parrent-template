/**
 * In-memory EntityManager cho integration test.
 *
 * Tạo một EntityManager giả lập (mockable) hoạt động trên dữ liệu từ
 * `data-test/hub-system-export-2026-06-11.json`. Mục đích: chạy được các
 * service method (findOne/find/persist/flush/count/getReference/nativeUpdate/
 * nativeDelete/remove) mà không cần database thật.
 *
 * Lưu ý: Đây là **in-memory simulation** - KHÔNG phải implementation đầy đủ
 * của MikroORM. Nó chỉ đủ logic để test các flow CRUD cơ bản trong
 * `BaseUsersService` và các base class khác.
 */

import type { FullExportFixture } from './fixture';

/**
 * Kết quả trả về của nativeUpdate.
 */
export interface FakeUpdateResult {
  affected?: number;
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
  remove: jest.Mock;
  getReference: jest.Mock;
  getRepository: jest.Mock;
  nativeUpdate: jest.Mock;
  nativeDelete: jest.Mock;
  // helpers (không có trong EM thật, chỉ dùng trong test)
  __store: FakeStore;
  __commit: () => void;
  __reset: () => void;
}

/**
 * Snapshot in-memory của database. Mỗi entity là một map id -> entity object.
 */
export interface FakeStore {
  users: Map<string, Record<string, unknown>>;
  user_roles: Map<string, Record<string, unknown>>;
  roles: Map<string, Record<string, unknown>>;
  settings: Map<string, Record<string, unknown>>;
}

/**
 * Tạo fake EntityManager với dữ liệu nạp từ fixture.
 *
 * @param fixture - Dữ liệu export; nếu không truyền sẽ dùng loader mặc định.
 */
export function createFakeEntityManager(
  fixture: FullExportFixture,
): FakeEntityManager {
  const store: FakeStore = {
    users: new Map(),
    user_roles: new Map(),
    roles: new Map(),
    settings: new Map(),
  };

  for (const u of fixture.users ?? []) {
    store.users.set(u.id as string, { ...u });
  }
  for (const ur of fixture.user_roles ?? []) {
    store.user_roles.set(ur.id as string, { ...ur });
  }
  for (const r of fixture.roles ?? []) {
    store.roles.set(r.id as string, { ...r });
  }
  for (const s of fixture.settings ?? []) {
    store.settings.set(s.id as string, { ...s });
  }

  const isUserEntity = (entity: unknown): boolean => {
    return (
      entity === 'User' ||
      (typeof entity === 'function' && entity.name === 'User')
    );
  };
  const isUserRoleEntity = (entity: unknown): boolean => {
    return (
      entity === 'UserRole' ||
      (typeof entity === 'function' && entity.name === 'UserRole')
    );
  };
  const isRoleEntity = (entity: unknown): boolean => {
    return (
      entity === 'Role' ||
      (typeof entity === 'function' && entity.name === 'Role')
    );
  };
  const isSettingEntity = (entity: unknown): boolean => {
    return (
      entity === 'Setting' ||
      (typeof entity === 'function' && entity.name === 'Setting')
    );
  };

  const matchFilter = (
    entity: Record<string, unknown>,
    filter: unknown,
  ): boolean => {
    if (!filter || typeof filter !== 'object') return true;
    for (const [key, condition] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(condition)) {
        if (!condition.some((sub) => matchFilter(entity, sub))) return false;
        continue;
      }
      const value = entity[key];
      if (condition === null && value !== null && value !== undefined)
        return false;
      if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        // $in / $ne / $like / nested object
        if ('$in' in (condition as Record<string, unknown>)) {
          const arr = (condition as { $in: unknown[] }).$in;
          if (!arr.includes(value)) return false;
        } else if ('$ne' in (condition as Record<string, unknown>)) {
          if (value === (condition as { $ne: unknown }).$ne) return false;
        } else if ('$like' in (condition as Record<string, unknown>)) {
          const pattern = String(
            (condition as { $like: unknown }).$like,
          ).replace(/%/g, '');
          if (
            typeof value !== 'string' ||
            !value.toLowerCase().includes(pattern.toLowerCase())
          ) {
            return false;
          }
        } else {
          // Nested object (e.g. { role: { name: 'super_admin' } })
          if (!value || typeof value !== 'object') return false;
          if (!matchFilter(value as Record<string, unknown>, condition)) {
            return false;
          }
        }
      } else {
        if (value !== condition) return false;
      }
    }
    return true;
  };

  const orderEntries = (
    list: Record<string, unknown>[],
    orderBy: unknown,
  ): Record<string, unknown>[] => {
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
  };

  // Cached user-role-role join data
  const cachedUserRoles: Record<string, unknown>[] = Array.from(
    store.user_roles.values(),
  );
  const cachedRoles: Record<string, unknown>[] = Array.from(
    store.roles.values(),
  );

  const findOne: jest.Mock = jest.fn(
    (
      entity: unknown,
      filter: unknown,
      options?: { populate?: string[]; orderBy?: unknown },
    ): Record<string, unknown> | null => {
      let map: Map<string, Record<string, unknown>>;
      if (isUserEntity(entity)) map = store.users;
      else if (isUserRoleEntity(entity)) map = store.user_roles;
      else if (isRoleEntity(entity)) map = store.roles;
      else if (isSettingEntity(entity)) map = store.settings;
      else map = new Map();
      for (const item of map.values()) {
        if (matchFilter(item, filter)) {
          const copy: Record<string, unknown> = { ...item };
          // Populate support for findOne
          if (isUserEntity(entity) && options?.populate) {
            if (options.populate.includes('userRoles')) {
              const userId = item.id as string;
              const userRoles = cachedUserRoles
                .filter((ur) => ur.userId === userId)
                .map((ur) => {
                  const role = cachedRoles.find(
                    (r) => r.id === (ur as { roleId: string }).roleId,
                  );
                  return { ...ur, role: role ? { ...role } : null };
                });
              copy.userRoles = userRoles;
            }
          }
          if (isUserRoleEntity(entity) && options?.populate) {
            if (options.populate.includes('user')) {
              const userId = (item as { userId: string }).userId;
              const user = store.users.get(userId);
              if (user) copy.user = { ...user };
            }
            if (options.populate.includes('role')) {
              const roleId = (item as { roleId: string }).roleId;
              const role = store.roles.get(roleId);
              if (role) copy.role = { ...role };
            }
          }
          return copy;
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
      let source: Record<string, unknown>[];
      if (isUserEntity(entity)) source = Array.from(store.users.values());
      else if (isUserRoleEntity(entity))
        source = Array.from(store.user_roles.values());
      else if (isRoleEntity(entity)) source = Array.from(store.roles.values());
      else if (isSettingEntity(entity))
        source = Array.from(store.settings.values());
      else source = [];

      const filtered = source.filter((it) => matchFilter(it, filter));
      const ordered = orderEntries(filtered, options?.orderBy);

      // populate
      const populated = ordered.map((it) => {
        const copy: Record<string, unknown> = { ...it };
        if (isUserEntity(entity) && options?.populate) {
          if (options.populate.includes('userRoles')) {
            const userId = it.id as string;
            const userRoles = cachedUserRoles
              .filter((ur) => ur.userId === userId)
              .map((ur) => {
                const role = cachedRoles.find(
                  (r) => r.id === (ur as { roleId: string }).roleId,
                );
                return { ...ur, role: role ? { ...role } : null };
              });
            copy.userRoles = userRoles;
          }
        }
        if (isUserRoleEntity(entity) && options?.populate) {
          if (options.populate.includes('user')) {
            const userId = (it as { userId: string }).userId;
            const user = store.users.get(userId);
            if (user) copy.user = { ...user };
          }
          if (options.populate.includes('role')) {
            const roleId = (it as { roleId: string }).roleId;
            const role = store.roles.get(roleId);
            if (role) copy.role = { ...role };
          }
        }
        return copy;
      });

      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? populated.length;
      return populated.slice(offset, offset + limit);
    },
  );

  const count: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown): number => {
      return find(entity, filter).length;
    },
  );

  const persist: jest.Mock = jest.fn(
    (entity: Record<string, unknown> | Record<string, unknown>[]) => {
      const list = Array.isArray(entity) ? entity : [entity];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const id = item.id as string | undefined;
        if (typeof id === 'string') {
          // Determine target store
          if (Array.isArray((item as { userRoles?: unknown }).userRoles)) {
            // User entity
            const copy = { ...item };
            store.users.set(id, copy);
          } else if (
            'userId' in (item as Record<string, unknown>) &&
            'roleId' in (item as Record<string, unknown>)
          ) {
            store.user_roles.set(id, { ...item });
          } else {
            // Default: users
            store.users.set(id, { ...item });
          }
        }
      }
      return Promise.resolve(undefined);
    },
  );

  const flush: jest.Mock = jest.fn(() => Promise.resolve(undefined));

  const remove: jest.Mock = jest.fn(
    (entity: Record<string, unknown>) => {
      const id = entity.id as string;
      if (store.users.has(id)) store.users.delete(id);
      else if (store.user_roles.has(id)) store.user_roles.delete(id);
      return Promise.resolve(undefined);
    },
  );

  const getReference: jest.Mock = jest.fn(
    (_entity: unknown, id: string | number): Record<string, unknown> => {
      return { id };
    },
  );

  const getRepository: jest.Mock = jest.fn(() => ({
    find: jest.fn((filter: unknown) => {
      return Array.from(store.users.values()).filter((u) =>
        matchFilter(u, filter),
      );
    }),
  }));

  const nativeUpdate: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown, update: Record<string, unknown>) => {
      const list = find(entity, filter);
      for (const item of list) {
        Object.assign(item, update);
        if (isUserEntity(entity))
          store.users.set(item.id as string, item);
        else if (isUserRoleEntity(entity))
          store.user_roles.set(item.id as string, item);
      }
      // MikroORM nativeUpdate trả về Promise<number>
      return Promise.resolve(list.length);
    },
  );

  const nativeDelete: jest.Mock = jest.fn(
    (entity: unknown, filter: unknown) => {
      const list = find(entity, filter);
      for (const item of list) {
        const id = item.id as string;
        if (isUserEntity(entity) && store.users.has(id))
          store.users.delete(id);
        else if (isUserRoleEntity(entity) && store.user_roles.has(id))
          store.user_roles.delete(id);
      }
      return Promise.resolve(list.length);
    },
  );

  const commit = () => {
    // No-op - flush already updates store
  };

  const reset = () => {
    store.users.clear();
    store.user_roles.clear();
    store.roles.clear();
    store.settings.clear();
    for (const u of fixture.users ?? []) {
      store.users.set(u.id as string, { ...u });
    }
    for (const ur of fixture.user_roles ?? []) {
      store.user_roles.set(ur.id as string, { ...ur });
    }
    for (const r of fixture.roles ?? []) {
      store.roles.set(r.id as string, { ...r });
    }
    for (const s of fixture.settings ?? []) {
      store.settings.set(s.id as string, { ...s });
    }
  };

  return {
    findOne,
    find,
    count,
    persist,
    flush,
    remove,
    getReference,
    getRepository,
    nativeUpdate,
    nativeDelete,
    __store: store,
    __commit: commit,
    __reset: reset,
  };
}
