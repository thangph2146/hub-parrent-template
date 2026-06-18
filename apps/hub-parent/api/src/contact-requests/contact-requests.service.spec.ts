/**
 * ContactRequestsService Unit Tests — binding OOP extends @workspace/api-server BaseCrudService.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ContactRequestsService } from './contact-requests.service';

describe('ContactRequestsService', () => {
  let service: ContactRequestsService;
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
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactRequestsService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<ContactRequestsService>(ContactRequestsService);
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
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.getById(1);

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getById(99999);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete via nativeUpdate', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.softDelete(1);

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore via nativeUpdate', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.restore(1);

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.hardDelete(1);

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', [1]);

      expect(result.success).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();
    });

    it('should throw when ids is empty', async () => {
      await expect(service.bulk('delete', [])).rejects.toThrow(BadRequestException);
    });
  });

});
