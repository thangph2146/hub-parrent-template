/**
 * BaseSessionsService unit tests — sinh bởi generate-unified-service-specs.cjs.
 */
import { EntityManager } from '@mikro-orm/core';
import { BaseSessionsService } from './sessions.service';

class TestSessionsService extends BaseSessionsService {
  constructor(private readonly emRef: Partial<EntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as EntityManager;
  }

  protected getSessionEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getAuthRoleNames() {
    return { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'User' };
  }
}

describe('BaseSessionsService', () => {
  let service: TestSessionsService;
  let em: Partial<EntityManager>;

  beforeEach(() => {
    em = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      count: jest.fn().mockResolvedValue(0),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockReturnValue({ id: 1 }),
      getConnection: jest.fn().mockReturnValue({ execute: jest.fn().mockResolvedValue([]) }),
    };
    service = new TestSessionsService(em);
  });

  describe('list', () => {
    it('trả về data + pagination', async () => {
      em.findAndCount = jest.fn().mockResolvedValue([[], 0]);
      em.count = jest.fn().mockResolvedValue(0);
      const result = await service.list({ page: 1, limit: 10, status: 'active' as const });
      expect(result).toEqual(expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            total: 0,
          }),
        }));
    });
  });

  describe('getById', () => {
    it('null khi không tìm thấy', async () => {
      em.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getById('999')).resolves.toBeNull();
    });
  });

  describe('getSuperAdminUserIds', () => {
    it('trả về mảng id', async () => {
      em.find = jest.fn().mockResolvedValue([{ user: { id: 1 } }]);
      await expect(service.getSuperAdminUserIds()).resolves.toEqual([1]);
    });
  });
});
