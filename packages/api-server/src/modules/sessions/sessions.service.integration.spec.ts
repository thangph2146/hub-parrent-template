/**
 * BaseSessionsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseSessionsService } from './sessions.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class Session {
  id = 0;
}

class User {
  id = 0;
}

class Role {
  id = 0;
}

class UserRole {
  id = 0;
}

class TestSessionsServiceIntegration extends BaseSessionsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getSessionEntity(): new () => Record<string, unknown> {
    return Session as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getAuthRoleNames() {
    return {
      USER: 'user',
      ADMIN: 'admin',
      SUPER_ADMIN: 'superadmin',
    };
  }
}

describe('BaseSessionsService — integration (fixture)', () => {
  let service: TestSessionsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.sessions ?? [];

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestSessionsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang với dữ liệu fixture', async () => {
      const result = await service.list({ page: 1, limit: 10, status: 'all' });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination.total).toBe(fixtureRows.length);
    });
  });

  describe('getById', () => {
    it('trả session tồn tại trong fixture', async () => {
      const first = fixtureRows.find((r) => r.id != null);
      if (!first?.id) return;
      const row = await service.getById(String(first.id));
      expect(row).not.toBeNull();
      expect(row?.id).toBe(Number(first.id));
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getById('999999')).toBeNull();
    });
  });
});
