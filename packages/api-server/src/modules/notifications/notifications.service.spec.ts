/**
 * BaseNotificationsService unit tests — sinh bởi generate-unified-service-specs.cjs.
 */
import { EntityManager } from '@mikro-orm/core';
import { BaseNotificationsService } from './notifications.service';

class TestNotificationsService extends BaseNotificationsService {
  constructor(private readonly emRef: Partial<EntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as EntityManager;
  }

  protected getNotificationEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getMessageEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return class {} as new () => Record<string, unknown>;
  }

  protected emitNotificationToUser = jest.fn();
}

describe('BaseNotificationsService', () => {
  let service: TestNotificationsService;
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
    service = new TestNotificationsService(em);
  });

  describe('list', () => {
    it('trả về data + pagination', async () => {
      em.findAndCount = jest.fn().mockResolvedValue([[], 0]);
      em.count = jest.fn().mockResolvedValue(0);
      const result = await service.list({ userId: '1', limit: 10, offset: 0 });
      expect(result).toEqual(expect.objectContaining({
          notifications: expect.any(Array),
          total: 0,
        }));
    });
  });

  describe('getSuperAdminUserIds', () => {
    it('trả về mảng id', async () => {
      em.find = jest.fn().mockResolvedValue([{ user: { id: 1 } }]);
      await expect(service.getSuperAdminUserIds()).resolves.toEqual([1]);
    });
  });
});
