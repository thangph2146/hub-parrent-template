/**
 * BaseAccountsService unit tests — sinh bởi generate-unified-service-specs.cjs.
 */
import { EntityManager } from '@mikro-orm/core';
import { BaseAccountsService } from './accounts.service';

class TestAccountsService extends BaseAccountsService {
  constructor(private readonly emRef: Partial<EntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as EntityManager;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }
}

describe('BaseAccountsService', () => {
  let service: TestAccountsService;
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
    service = new TestAccountsService(em);
  });

  describe('getProfile', () => {
    it('null khi user không tồn tại', async () => {
      em.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getProfile('999')).resolves.toBeNull();
    });
  });
});
