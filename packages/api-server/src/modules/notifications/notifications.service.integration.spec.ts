/**
 * BaseNotificationsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseNotificationsService } from './notifications.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class Notification {
  id = 0;
}

class User {
  id = 0;
}

class UserRole {
  id = 0;
}

class Message {
  id = 0;
}

class ContactRequest {
  id = 0;
}

class TestNotificationsServiceIntegration extends BaseNotificationsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getNotificationEntity(): new () => Record<string, unknown> {
    return Notification as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getMessageEntity(): new () => Record<string, unknown> {
    return Message as unknown as new () => Record<string, unknown>;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected emitNotificationToUser(): void {
    // no-op trong integration test
  }
}

describe('BaseNotificationsService — integration (fixture)', () => {
  let service: TestNotificationsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.notifications ?? [];
  const sampleUserId = fixtureRows.find((r) => r.userId != null)?.userId;

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestNotificationsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang theo userId từ fixture', async () => {
      if (sampleUserId == null) return;
      const userId = Number(sampleUserId);
      const expected = fixtureRows.filter((r) => Number(r.userId) === userId).length;
      const result = await service.list({ userId, limit: 10, offset: 0 });
      expect(result.total).toBe(expected);
      expect(result.notifications.length).toBeLessThanOrEqual(10);
      expect(result.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('listForAdminTable', () => {
    it('trả pagination admin table', async () => {
      if (sampleUserId == null) return;
      const result = await service.listForAdminTable({
        userId: Number(sampleUserId),
        page: 1,
        limit: 10,
      });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(0);
    });
  });
});
