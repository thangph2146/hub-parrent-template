/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * EventCheckoutsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { EventCheckoutsService } from './event-checkouts.service';

describe('EventCheckoutsService', () => {
  let service: EventCheckoutsService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      nativeUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventCheckoutsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<EventCheckoutsService>(EventCheckoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
