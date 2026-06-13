/**
 * BaseEventCheckinsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseEventCheckinsService } from './event-checkins.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class EventCheckin {
  id = 0;
}

class Event {
  id = 0;
}

class EventRegistration {
  id = 0;
}

class TestEventCheckinsServiceIntegration extends BaseEventCheckinsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getEventCheckinEntity(): new () => Record<string, unknown> {
    return EventCheckin as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseEventCheckinsService — integration (fixture)', () => {
  let service: TestEventCheckinsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();

  const seededEventId = 27;

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    em.__store.event_checkins.set('1', {
      id: 1,
      eventId: 27,
      event: { id: 27 },
      email: 'demo.khach@hub.edu.vn',
      fullName: 'Khách demo (check-in)',
      checkinTime: '2026-06-11T02:00:00.000Z',
      checkinType: 0,
      faceVerified: false,
      status: 1,
      deletedAt: null,
      createdAt: '2026-06-11T02:00:00.000Z',
      updatedAt: '2026-06-11T02:00:00.000Z',
    });
    service = new TestEventCheckinsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    em.__store.event_checkins.set('1', {
      id: 1,
      eventId: 27,
      event: { id: 27 },
      email: 'demo.khach@hub.edu.vn',
      fullName: 'Khách demo (check-in)',
      checkinTime: '2026-06-11T02:00:00.000Z',
      checkinType: 0,
      faceVerified: false,
      status: 1,
      deletedAt: null,
      createdAt: '2026-06-11T02:00:00.000Z',
      updatedAt: '2026-06-11T02:00:00.000Z',
    });
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang theo eventId (seed in-memory)', async () => {
      const result = await service.list({
        eventId: seededEventId,
        page: 1,
        limit: 10,
        status: 'active',
      });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.email).toBe('demo.khach@hub.edu.vn');
    });
  });

  describe('getById', () => {
    it('trả checkin seed', async () => {
      const row = await service.getById('1');
      expect(row?.id).toBe(1);
    });

    it('null với id không tồn tại', async () => {
      expect(await service.getById('999999')).toBeNull();
    });
  });

  describe('bulk', () => {
    it('bulk delete ids rỗng', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
    });
  });
});
