/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * EventCheckinsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { EventCheckinsService } from './event-checkins.service';

describe('EventCheckinsService', () => {
  let service: EventCheckinsService;
  let em: Partial<EntityManager>;

  const mockEntity = {
    id: 1,
    event: { id: 1 },
    email: 'test@example.com',
    fullName: 'Test User',
    checkinTime: new Date('2026-01-01'),
    checkinType: 0,
    faceVerified: false,
    status: 1,
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
      providers: [
        EventCheckinsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<EventCheckinsService>(EventCheckinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValue([mockEntity]);
      (em.count as jest.Mock).mockResolvedValue(1);

      const result = await service.list({ page: 1, limit: 10, eventId: '1' });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockEntity);
      expect(await service.getById('1')).not.toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValue({ ...mockEntity, deletedAt: null });
      expect(await service.softDelete('1')).toBe(true);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(mockEntity);
      expect(await service.hardDelete('1')).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });
  });
});
