/**
 * Integration test cho `BaseUsersService` dùng dữ liệu thực từ
 * `data-test/hub-system-export-2026-06-11.json` (47MB, 10 users + 7 roles).
 *
 * Service instance thật + fake EntityManager mô phỏng database từ fixture.
 */
import { BaseUsersService } from './users.service';
import { loadFixture, findUserById, getUserIdsForRole } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

/**
 * Subclass thực tế của `BaseUsersService` cho integration test.
 */
class TestUsersService extends BaseUsersService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }
  protected getEm(): import('@mikro-orm/core').EntityManager {
    return this.emRef as unknown as import('@mikro-orm/core').EntityManager;
  }
  protected getUserEntity(): unknown {
    return 'User';
  }
  protected getRoleEntity(): unknown {
    return 'Role';
  }
  protected getUserRoleEntity(): unknown {
    return 'UserRole';
  }
  protected getSettingEntity(): unknown {
    return 'Setting';
  }
}

describe('BaseUsersService - integration test (real fixture data)', () => {
  let service: TestUsersService;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestUsersService(em);
  });

  beforeEach(() => {
    // Reset to clean state before each test
    em.__reset();
    jest.clearAllMocks();
  });

  describe('resolveActorEmail', () => {
    it('should return email of real user from fixture', async () => {
      const sampleUser = fixture.users[0];
      const email = await service.resolveActorEmail(sampleUser.id as string);
      expect(email).toBe((sampleUser.email as string).toLowerCase());
    });

    it('should return null for non-existing user', async () => {
      const email = await service.resolveActorEmail('__not_exists__');
      expect(email).toBeNull();
    });
  });

  describe('getById', () => {
    it('should return real user with roles populated', async () => {
      const sampleUser = fixture.users[0];
      const result = await service.getById(sampleUser.id as string);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(sampleUser.id);
      expect(result?.email).toBeDefined();
      // Should have userRoles populated
      const userId = sampleUser.id as string;
      const expectedRoles = fixture.user_roles.filter(
        (ur) => ur.userId === userId,
      );
      expect(result?.roles).toHaveLength(expectedRoles.length);
    });

    it('should return null for non-existing id', async () => {
      const result = await service.getById('__not_exists__');
      expect(result).toBeNull();
    });

    it('should return id and email matching fixture', async () => {
      const user = findUserById(fixture.users[0].id as string, fixture);
      if (!user) throw new Error('Sample user missing');
      const result = await service.getById(user.id as string);
      expect(result?.email).toBe((user.email as string).toLowerCase());
      expect(result?.id).toBe(user.id);
    });
  });

  describe('list', () => {
    it('should return all active users with pagination', async () => {
      const result = await service.list({ page: 1, limit: 100 });
      expect(result.data.length).toBeGreaterThan(0);
      // All non-deleted users from fixture
      const activeCount = fixture.users.filter(
        (u) => u.deletedAt == null,
      ).length;
      expect(result.pagination.total).toBe(activeCount);
    });

    it('should respect limit and skip', async () => {
      const result = await service.list({ page: 1, limit: 3 });
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.pagination.limit).toBe(3);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by search term on email/name/phone', async () => {
      const sample = fixture.users.find(
        (u) => typeof u.email === 'string' && u.email.includes('@'),
      );
      if (!sample) return;
      const partial = (sample.email as string).split('@')[0].slice(0, 3);
      const result = await service.list({
        page: 1,
        limit: 100,
        search: partial,
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should filter by deleted status', async () => {
      const result = await service.list({
        page: 1,
        limit: 100,
        status: 'deleted',
      });
      const deletedInFixture = fixture.users.filter(
        (u) => u.deletedAt != null,
      );
      expect(result.pagination.total).toBe(deletedInFixture.length);
    });
  });

  describe('bulk', () => {
    it('should return 0 affected for empty ids', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
      expect(result.message).toContain('Không có bản ghi');
    });

    it('should bulk delete active users', async () => {
      const activeIds = fixture.users
        .filter((u) => u.deletedAt == null)
        .map((u) => u.id as string)
        .slice(0, 2);
      const result = await service.bulk('delete', activeIds);
      expect(result.affected).toBe(2);
    });

    it('should bulk activate users', async () => {
      const ids = fixture.users
        .slice(0, 3)
        .map((u) => u.id as string);
      const result = await service.bulk('active', ids);
      expect(result.affected).toBe(3);
    });

    it('should not deactivate super_admin in bulk unactive', async () => {
      const superAdminIds = getUserIdsForRole('super_admin', fixture);
      const otherIds = fixture.users
        .map((u) => u.id as string)
        .filter((id) => !superAdminIds.includes(id));
      const result = await service.bulk('unactive', [
        ...otherIds.slice(0, 1),
        ...superAdminIds,
      ]);
      // super_admin should be filtered out
      expect(result.affected).toBe(1);
    });
  });

  describe('softDelete + restore', () => {
    it('should soft delete and restore a non-protected user', async () => {
      // Pick a non-protected user
      const nonProtected = fixture.users.find(
        (u) => u.email !== 'superadmin@hub.edu.vn',
      );
      if (!nonProtected) {
        // Skip if fixture doesn't have superadmin
        return;
      }
      const id = nonProtected.id as string;
      const ok1 = await service.softDelete(id);
      expect(ok1).toBe(true);

      const ok2 = await service.restore(id);
      expect(ok2).toBe(true);
    });

    it('should throw when soft deleting protected admin', async () => {
      const protectedEmail = 'superadmin@hub.edu.vn';
      const adminUser = fixture.users.find(
        (u) => (u.email as string)?.toLowerCase() === protectedEmail,
      );
      if (!adminUser) {
        return; // Skip nếu fixture không có protected admin
      }
      await expect(
        service.softDelete(adminUser.id as string),
      ).rejects.toThrow();
    });

    it('should return false when user not found', async () => {
      const ok = await service.softDelete('__not_exists__');
      expect(ok).toBe(false);
    });
  });

  describe('listDevelopmentLoginOptions', () => {
    it('should return dev login options from fixture', async () => {
      const options = await service.listDevelopmentLoginOptions();
      expect(options.length).toBeGreaterThan(0);
      options.forEach((opt) => {
        expect(typeof opt.email).toBe('string');
        expect(opt.email.length).toBeGreaterThan(0);
        expect(Array.isArray(opt.roleNames)).toBe(true);
      });
    });

    it('should filter by role name', async () => {
      const allOptions = await service.listDevelopmentLoginOptions();
      const superAdminOptions = allOptions.filter((o) =>
        o.roleNames.includes('super_admin'),
      );
      expect(superAdminOptions.length).toBeGreaterThan(0);
    });
  });
});
