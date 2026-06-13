/**
 * BaseAccountsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseAccountsService } from './accounts.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class User {
  id = 0;
}

class UserRole {
  id = 0;
}

class TestAccountsServiceIntegration extends BaseAccountsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseAccountsService — integration (fixture)', () => {
  let service: TestAccountsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const sampleUser = fixture.users?.find((u) => u.isActive !== false && u.deletedAt == null);

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestAccountsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('trả profile user tồn tại kèm roles', async () => {
      if (!sampleUser?.id) return;
      const profile = await service.getProfile(String(sampleUser.id));
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe(Number(sampleUser.id));
      expect(profile?.email).toBe(String(sampleUser.email ?? '').toLowerCase() || profile?.email);
      expect(Array.isArray(profile?.roles)).toBe(true);
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getProfile('999999')).toBeNull();
    });
  });
});
