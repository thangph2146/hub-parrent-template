/**
 * EventsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let em: Partial<EntityManager>;

  const mockEntity = {
    id: 1,
    title: 'Event',
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

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
      providers: [EventsService, { provide: EntityManager, useValue: em }],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('softDelete', () => {
    it('should soft delete event', async () => {
      (em.findOne as jest.Mock).mockResolvedValue({ ...mockEntity, deletedAt: null });
      expect(await service.softDelete('1')).toBe(true);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });
});
