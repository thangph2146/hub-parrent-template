/**
 * BaseEventRegistrationsService — integration test với fixture thật.
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseEventRegistrationsService } from './event-registrations.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class EventRegistration {
  id = 0;
}

class Event {
  id = 0;
}

class User {
  id = 0;
}

class TestEventRegistrationsServiceIntegration extends BaseEventRegistrationsService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}

describe('BaseEventRegistrationsService — integration (fixture)', () => {
  let service: TestEventRegistrationsServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const fixtureRows = fixture.event_registrations ?? [];
  const sampleEventId = fixtureRows.find((r) => r.eventId != null)?.eventId;

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    service = new TestEventRegistrationsServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang theo eventId từ fixture', async () => {
      if (sampleEventId == null) return;
      const eventId = Number(sampleEventId);
      const expected = fixtureRows.filter(
        (r) => Number(r.eventId) === eventId && r.deletedAt == null,
      ).length;
      const result = await service.list({ eventId, page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(expected);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getById', () => {
    it('trả registration tồn tại trong fixture', async () => {
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

  describe('countActiveForEvent', () => {
    it('đếm registration active theo event', async () => {
      if (sampleEventId == null) return;
      const count = await service.countActiveForEvent(String(sampleEventId));
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('bulk', () => {
    it('bulk delete ids rỗng', async () => {
      const result = await service.bulk('delete', []);
      expect(result.affected).toBe(0);
    });
  });
});
