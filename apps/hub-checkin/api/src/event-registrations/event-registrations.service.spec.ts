/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * EventRegistrationsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { EventRegistrationsService } from './event-registrations.service';

describe('EventRegistrationsService', () => {
  let service: EventRegistrationsService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      nativeUpdate: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRegistrationsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<EventRegistrationsService>(EventRegistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
