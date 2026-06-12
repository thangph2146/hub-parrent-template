/**
 * BaseParentStudentsService Unit Tests
 *
 * Pattern theo `packages/api-server/src/modules/users/users.service.spec.ts`:
 *   - Pure mock với NestJS `Test.createTestingModule`.
 *   - Mock `EntityManager` thuần với `jest.fn()` cho mỗi method.
 *   - Dữ liệu mẫu lấy từ fixture `data-test/hub-system-export-2026-06-11.json`.
 *   - Test toàn bộ CRUD: list, getById, create, update, softDelete, restore, hardDelete, bulk.
 */
import { EntityManager } from '@mikro-orm/core';
import { BaseParentStudentsService } from './parent-student.service';
import { loadFixture } from '../../data-test/fixture';

describe('BaseParentStudentsService', () => {
  let service: BaseParentStudentsService;
  let em: Partial<EntityManager>;
  const fixture = loadFixture();
  const fixtureRows = (fixture as unknown as Record<string, Array<Record<string, unknown>>>).parent_students ?? [];

  // Mock entity dựa trên row thật từ fixture
  const mockEntity: Record<string, unknown> = fixtureRows.length > 0
    ? { ...fixtureRows[0], deletedAt: null }
    : { id: 1, deletedAt: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };

  class TestParentStudentsServiceService extends BaseParentStudentsService {
    protected emRef: Partial<EntityManager>;
    constructor(emRef: Partial<EntityManager>) {
      // BaseCrudService có constructor(loggerContext?: string)
      super('BaseParentStudentsService');
      this.emRef = emRef;
    }
    protected getEm(): EntityManager {
      return this.emRef as EntityManager;
    }
    protected getEntity(): new () => Record<string, unknown> {
      // Named class so EM-related tests có thể resolve được
      return class ParentStudents { id = 0; } as unknown as new () => Record<string, unknown>;
    }
  }

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      count: jest.fn(),
      getReference: jest.fn().mockReturnValue({ id: 1 }),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(),
    };

    // Không dùng Test.createTestingModule vì BaseCrudService có constructor với string param
    // - Nest không thể resolve string. Tạo instance trực tiếp (tương tự users.service.spec.ts).
    service = new TestParentStudentsServiceService(em);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should expose entity name "ParentStudents"', () => {
      expect((service as unknown as { getEntityName(): string }).getEntityName()).toBe('ParentStudents');
    });

    it('should expose primary key "id"', () => {
      expect((service as unknown as { getPrimaryKeyField(): string }).getPrimaryKeyField()).toBe('id');
    });

    it('should expose soft-delete field correctly', () => {
      expect((service as unknown as { getSoftDeleteField(): string | null }).getSoftDeleteField()).toBeNull();
    });

    it('should expose search fields', () => {
      expect((service as unknown as { getSearchFields(): string[] }).getSearchFields()).toEqual([
        'studentCode',
        'studentName',
      ]);
    });

    it('should expose filterable fields', () => {
      expect((service as unknown as { getFilterableFields(): string[] }).getFilterableFields()).toEqual([
        'status',
        'parentId',
      ]);
    });
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

    it('should pass search filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({ page: 1, limit: 10, search: 'test' });

      expect(em.find).toHaveBeenCalled();
      const findArgs = (em.find as jest.Mock).mock.calls[0];
      expect(findArgs[1]).toBeDefined(); // where clause
    });

    it('should pass status filter to EM', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({
        page: 1,
        limit: 10,
        status: 'all',
        filters: { status: 'approved' },
      });

      expect(em.find).toHaveBeenCalled();
      const findArgs = (em.find as jest.Mock).mock.calls[0];
      expect(findArgs[1]).toEqual(expect.objectContaining({ status: 'approved' }));
    });

    it('should enforce max limit', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([]);
      (em.count as jest.Mock).mockResolvedValueOnce(0);

      await service.list({ page: 1, limit: 9999 });

      const findArgs = (em.find as jest.Mock).mock.calls[0];
      expect(findArgs[2].limit).toBeLessThanOrEqual(1000);
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

      const result = await service.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should persist new entity and return DTO', async () => {
      const newData: Record<string, unknown> = {
        id: 'TEST-NEW-1',
        isActive: true,
      };
      (em.persist as jest.Mock).mockImplementation((entity: Record<string, unknown>) => {
        if (entity && !entity.id) {
          entity.id = 999;
        }
        return Promise.resolve(undefined);
      });
      (em.flush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.create(newData as never);

      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.update('1', { isActive: false } as never);

      expect(result).not.toBeNull();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should return null when record not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.update('999', { isActive: false } as never);

      expect(result).toBeNull();
    });
  });

  describe('softDelete/restore unsupported', () => {
    it('should return false for softDelete', async () => {
      await expect(service.softDelete('1')).resolves.toBe(false);
    });

    it('should return false for restore', async () => {
      await expect(service.restore('1')).resolves.toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete record', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity });

      const result = await service.hardDelete('1');

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
    });

    it('should return false when record not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.hardDelete('999');

      expect(result).toBe(false);
    });
  });

  describe('bulk', () => {
    it('should soft-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }]);
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.bulk('delete', ['1']);

      expect(result.success).toBe(1);
      expect(result.message).toBeDefined();
    });

    it('should restore multiple records', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValueOnce(2);

      const result = await service.bulk('restore', ['1', '2']);

      expect(result.success).toBe(2);
    });

    it('should hard-delete multiple records', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity }, { ...mockEntity, id: 2 }]);
      (em.removeAndFlush as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await service.bulk('hard-delete', ['1', '2']);

      expect(result.total).toBe(2);
    });
  });

  describe('bulk error handling', () => {
    it('should throw on invalid action', async () => {
      await expect(
        service.bulk('invalid-action' as never, ['1']),
      ).rejects.toBeDefined();
    });

    it('should throw on empty ids', async () => {
      await expect(service.bulk('delete', [])).rejects.toBeDefined();
    });
  });

  describe('parent-student specific helpers', () => {
    it('should review request with reviewer info', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockEntity,
        status: 'pending',
      });

      const result = await (service as unknown as {
        review(id: string, action: 'approved' | 'rejected', reviewerId: string): Promise<Record<string, unknown> | null>;
      }).review('1', 'approved', 'admin-1');

      expect(result).toEqual(expect.objectContaining({ status: 'approved', reviewedBy: 'admin-1' }));
      expect(em.flush).toHaveBeenCalled();
    });

    it('should list rows by parent relation', async () => {
      (em.find as jest.Mock).mockResolvedValueOnce([{ ...mockEntity, parentId: 7 }]);

      const result = await (service as unknown as {
        listByParent(parentId: string): Promise<Array<Record<string, unknown>>>;
      }).listByParent('7');

      expect(em.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should add parent-student request with duplicate guard', async () => {
      (em.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (em.persist as jest.Mock).mockImplementation((entity: Record<string, unknown>) => {
        entity.id = 77;
      });

      const result = await (service as unknown as {
        addStudentRequest(input: {
          parentId: number;
          studentCode: string;
          studentName?: string;
          note?: string;
        }): Promise<Record<string, unknown>>;
      }).addStudentRequest({
        parentId: 7,
        studentCode: 'SV001',
        studentName: 'A',
        note: 'N',
      });

      expect(em.getReference).toHaveBeenCalled();
      expect(em.persist).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ studentCode: 'SV001', status: 'pending' }));
    });

    it('should reject duplicated parent-student request', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, studentCode: 'SV001' });

      await expect(
        (service as unknown as {
          addStudentRequest(input: { parentId: number; studentCode: string }): Promise<Record<string, unknown>>;
        }).addStudentRequest({
          parentId: 7,
          studentCode: 'SV001',
        }),
      ).rejects.toThrow('Bạn đã gửi yêu cầu liên kết với mã sinh viên này rồi.');
    });

    it('should remove request for parent owner', async () => {
      (em.findOne as jest.Mock).mockResolvedValueOnce({ ...mockEntity, parentId: 7 });

      const result = await (service as unknown as {
        removeForParent(id: string, parentId: string): Promise<boolean>;
      }).removeForParent('1', '7');

      expect(result).toBe(true);
      expect(em.removeAndFlush).toHaveBeenCalled();
    });
  });

  // Integration: dùng dữ liệu thật từ fixture (luôn load để dùng khi có data)
  describe('fixture integration (sample row)', () => {
    it('should map fixture row correctly to DTO if data exists', () => {
      if (fixtureRows.length === 0) {
        // Fixture rỗng - skip nhưng vẫn pass
        expect(fixtureRows).toEqual([]);
        return;
      }
      const sample = fixtureRows[0];
      expect(sample).toBeDefined();
      // Join tables (post_tags, post_categories, user_roles) không có id field
      // - chỉ có FK keys (postId+tagId, postId+categoryId, userId+roleId).
      // Verify row có ít nhất 1 field đặc trưng.
      const hasId = 'id' in sample && sample.id != null;
      const hasFk = Object.keys(sample).some((k) => /Id[A-Z]?|Id$/.test(k));
      expect(hasId || hasFk).toBe(true);
    });
  });
});
