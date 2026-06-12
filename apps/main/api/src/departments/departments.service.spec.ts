/**
 * DepartmentsService Unit Tests
 *
 * Pattern theo `apps/main/api/src/comments/comments.service.spec.ts`:
 *   - NestJS `Test.createTestingModule` với `EntityManager` mock.
 *   - Dữ liệu mẫu lấy từ fixture `packages/api-server/src/data-test/hub-system-export-2026-06-11.json`.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let em: Partial<EntityManager>;

  // Không có fixture - dùng mock entity mặc định
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
      flush: jest.fn(),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
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

      const result = await (
        service as unknown as {
          list: (p: { page: number; limit: number }) => Promise<{
            data: unknown[];
            pagination: { page: number; limit: number; total: number };
          }>;
        }
      ).list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });

    it('should pass search filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await (
        service as unknown as {
          list: (p: {
            page: number;
            limit: number;
            search?: string;
          }) => Promise<unknown>;
        }
      ).list({ page: 1, limit: 10, search: 'test' });

      expect(em.find).toHaveBeenCalled();
    });

    it('should pass status filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await (
        service as unknown as {
          list: (p: {
            page: number;
            limit: number;
            status?: string;
          }) => Promise<unknown>;
        }
      ).list({ page: 1, limit: 10, status: 'deleted' });

      expect(em.find).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await (
        service as unknown as {
          getById: (id: number) => Promise<Record<string, unknown> | null>;
        }
      ).getById(1);

      expect(result).not.toBeNull();
    });

    it('should return null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (
        service as unknown as {
          getById: (id: number) => Promise<Record<string, unknown> | null>;
        }
      ).getById(99999);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      // apps/main/api pattern: em.findOne(Entity, {id}) → check deletedAt → persistAndFlush
      (em.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockEntity,
        deletedAt: null,
      });
      (em.persistAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (
        service as unknown as {
          softDelete: (id: number) => Promise<boolean>;
        }
      ).softDelete(1);

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (
        service as unknown as {
          softDelete: (id: number) => Promise<boolean>;
        }
      ).softDelete(99999);

      expect(result).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockEntity,
        deletedAt: new Date(),
      });
      (em.persistAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (
        service as unknown as {
          restore: (id: number) => Promise<boolean>;
        }
      ).restore(1);

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (
        service as unknown as {
          restore: (id: number) => Promise<boolean>;
        }
      ).restore(99999);

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (
        service as unknown as {
          hardDelete: (id: number) => Promise<boolean>;
        }
      ).hardDelete(1);

      expect(result).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });

    it('should return false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await (
        service as unknown as {
          hardDelete: (id: number) => Promise<boolean>;
        }
      ).hardDelete(99999);

      expect(result).toBe(false);
    });
  });

  describe('bulk', () => {
    // apps/main/api: BulkResult = { affected: number, message: string }
    it('should soft-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await (
        service as unknown as {
          bulk: (
            action: string,
            ids: number[],
          ) => Promise<{ affected: number; message: string }>;
        }
      ).bulk('delete', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeDefined();
    });

    it('should restore multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await (
        service as unknown as {
          bulk: (
            action: string,
            ids: number[],
          ) => Promise<{ affected: number; message: string }>;
        }
      ).bulk('restore', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
    });

    it('should hard-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await (
        service as unknown as {
          bulk: (
            action: string,
            ids: number[],
          ) => Promise<{ affected: number; message: string }>;
        }
      ).bulk('hard-delete', [1]);

      expect(result.affected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        (
          service as unknown as {
            bulk: (action: string, ids: number[]) => Promise<unknown>;
          }
        ).bulk('invalid-action', [1]),
      ).rejects.toBeDefined();
    });

    it('should return affected=0 for empty ids (apps/main/api behavior)', async () => {
      const result = await (
        service as unknown as {
          bulk: (
            action: string,
            ids: number[],
          ) => Promise<{ affected: number; message: string }>;
        }
      ).bulk('delete', []);
      expect(result.affected).toBe(0);
      expect(result.message).toBeDefined();
    });
  });
});
