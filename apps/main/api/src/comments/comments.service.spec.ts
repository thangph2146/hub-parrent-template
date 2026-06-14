/**
 * CommentsService Unit Tests — binding OOP extends @workspace/api-server custom Base*.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let em: Partial<EntityManager>;

  const mockEntity: Record<string, unknown> = {
    id: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.getById('1');

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getById('99999');

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, deletedAt: null });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.softDelete('1');

      expect(result).toBe(true);
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockEntity,
        deletedAt: new Date(),
      });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.restore('1');

      expect(result).toBe(true);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.hardDelete('1');

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', ['1']);

      expect(result.affected).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();
    });

    it('should return affected=0 for empty ids', async () => {
      const result = await service.bulk('delete', []);

      expect(result.affected).toBe(0);
      expect(result.message).toBeDefined();
    });
  });

});
