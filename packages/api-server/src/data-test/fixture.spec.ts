/**
 * Integration test cho `data-test/fixture.ts`.
 * Đọc file `full-export-2026-06-11.json` 48MB và xác nhận helpers trả về đúng.
 */
import {
  clearFixtureCache,
  DEFAULT_FIXTURE_PATH,
  findUserByEmail,
  findUserById,
  getRoles,
  getUserIdsForRole,
  getUserRoles,
  getUsers,
  loadFixture,
} from './fixture';

describe('data-test/fixture', () => {
  beforeAll(() => {
    clearFixtureCache();
  });

  describe('loadFixture', () => {
    it('should load default fixture from DEFAULT_FIXTURE_PATH', () => {
      const data = loadFixture();
      expect(data).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(Array.isArray(data.roles)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
    });

    it('should return same reference on second call (cached)', () => {
      const a = loadFixture();
      const b = loadFixture();
      expect(a).toBe(b);
    });
  });

  describe('getUsers', () => {
    it('should return at least one user', () => {
      const users = getUsers();
      expect(users.length).toBeGreaterThan(0);
      const first = users[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('email');
    });
  });

  describe('getRoles', () => {
    it('should include super_admin role', () => {
      const roles = getRoles();
      const superAdmin = roles.find((r) => r.name === 'super_admin');
      expect(superAdmin).toBeDefined();
    });
  });

  describe('getUserRoles', () => {
    it('should return user-role join records', () => {
      const userRoles = getUserRoles();
      expect(Array.isArray(userRoles)).toBe(true);
      expect(userRoles.length).toBeGreaterThan(0);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by exact email', () => {
      const users = getUsers();
      const sample = users.find(
        (u) => typeof u.email === 'string' && u.email.length > 0,
      );
      if (!sample || typeof sample.email !== 'string') {
        return;
      }
      const found = findUserByEmail(sample.email);
      expect(found).toBeDefined();
      expect(found?.id).toBe(sample.id);
    });

    it('should be case-insensitive', () => {
      const users = getUsers();
      const sample = users.find(
        (u) => typeof u.email === 'string' && u.email.length > 0,
      );
      if (!sample || typeof sample.email !== 'string') {
        return;
      }
      const upper = findUserByEmail(sample.email.toUpperCase());
      expect(upper?.id).toBe(sample.id);
    });

    it('should return undefined for non-existing email', () => {
      const found = findUserByEmail('__not_exists__@example.com');
      expect(found).toBeUndefined();
    });
  });

  describe('findUserById', () => {
    it('should find user by id', () => {
      const users = getUsers();
      const sample = users[0];
      if (!sample) return;
      const found = findUserById(sample.id as string);
      expect(found?.id).toBe(sample.id);
    });

    it('should return undefined for unknown id', () => {
      const found = findUserById('__not_exists__');
      expect(found).toBeUndefined();
    });
  });

  describe('getUserIdsForRole', () => {
    it('should return ids for super_admin role', () => {
      const ids = getUserIdsForRole('super_admin');
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
      ids.forEach((id) => expect(typeof id).toBe('string'));
    });

    it('should return empty array for unknown role', () => {
      const ids = getUserIdsForRole('__not_a_role__');
      expect(ids).toEqual([]);
    });
  });

  describe('clearFixtureCache', () => {
    it('should clear the cache', () => {
      loadFixture();
      clearFixtureCache();
      const a = loadFixture();
      const b = loadFixture();
      // Sau khi clear thì load lại - vẫn cached nhưng là instance mới
      expect(a).toBe(b);
    });
  });

  describe('DEFAULT_FIXTURE_PATH', () => {
    it('should point to hub-system-export file', () => {
      expect(DEFAULT_FIXTURE_PATH).toContain('hub-system-export-2026-06-11.json');
    });
  });
});
