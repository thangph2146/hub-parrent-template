/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * EventSpeakersService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { EventSpeakersService } from './event-speakers.service';

describe('EventSpeakersService', () => {
  let service: EventSpeakersService;
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
        EventSpeakersService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<EventSpeakersService>(EventSpeakersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
