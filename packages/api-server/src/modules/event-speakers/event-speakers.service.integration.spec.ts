/**
 * BaseEventSpeakersService — integration test (seed in-memory).
 */
import type { EntityManager } from '@mikro-orm/core';
import { BaseEventSpeakersService } from './event-speakers.service';
import { loadFixture } from '../../data-test/fixture';
import { createFakeEntityManager } from '../../data-test/fake-em';

class EventSpeaker {
  id = 0;
}

class Event {
  id = 0;
}

class Speaker {
  id = 0;
}

class TestEventSpeakersServiceIntegration extends BaseEventSpeakersService {
  constructor(private readonly emRef: ReturnType<typeof createFakeEntityManager>) {
    super();
  }

  protected getEm(): EntityManager {
    return this.emRef as unknown as EntityManager;
  }

  protected getEventSpeakerEntity(): new () => Record<string, unknown> {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getSpeakerEntity(): new () => Record<string, unknown> {
    return Speaker as unknown as new () => Record<string, unknown>;
  }
}

const seedEventSpeaker = {
  id: 1,
  eventId: 27,
  speakerId: 1,
  event: { id: 27 },
  speaker: {
    id: 1,
    name: 'Diễn giả demo',
    title: 'TS.',
    organization: 'HUB',
    avatar: null,
  },
  sortOrder: 0,
  role: 'keynote',
  presentationTitle: 'Chủ đề demo',
  startTime: '2026-06-11T09:00:00.000Z',
  endTime: '2026-06-11T10:00:00.000Z',
  duration: 60,
  attachments: null,
};

describe('BaseEventSpeakersService — integration (fixture)', () => {
  let service: TestEventSpeakersServiceIntegration;
  let em: ReturnType<typeof createFakeEntityManager>;
  const fixture = loadFixture();
  const seededEventId = 27;

  beforeAll(() => {
    em = createFakeEntityManager(fixture);
    em.__store.speakers.set('1', {
      id: 1,
      name: 'Diễn giả demo',
      title: 'TS.',
      organization: 'HUB',
      avatar: null,
    });
    em.__store.event_speakers.set('1', { ...seedEventSpeaker });
    service = new TestEventSpeakersServiceIntegration(em);
  });

  beforeEach(() => {
    em.__reset();
    em.__store.speakers.set('1', {
      id: 1,
      name: 'Diễn giả demo',
      title: 'TS.',
      organization: 'HUB',
      avatar: null,
    });
    em.__store.event_speakers.set('1', { ...seedEventSpeaker });
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('phân trang theo eventId (seed in-memory)', async () => {
      const result = await service.list({
        eventId: seededEventId,
        page: 1,
        limit: 10,
      });
      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.speakerName).toBe('Diễn giả demo');
    });
  });

  describe('getById', () => {
    it('trả event speaker seed', async () => {
      const row = await service.getById('1');
      expect(row?.id).toBe(1);
      expect(row?.eventId).toBe(27);
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
