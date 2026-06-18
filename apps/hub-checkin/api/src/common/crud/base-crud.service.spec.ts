/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { EntityManager } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { BaseCrudService } from './base-crud.service';
import type { ListCrudParams, CrudRowDto } from './crud.types';

interface TestRow extends CrudRowDto {
  id: number;
  title: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

class TestCrudService extends BaseCrudService<TestRow> {
  private readonly em: Partial<EntityManager>;

  constructor(em: Partial<EntityManager>) {
    super('TestCrudService');
    this.em = em;
  }

  protected getEm(): EntityManager {
    return this.em as EntityManager;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return class TestEntity {
      id!: number;
      title = '';
      deletedAt: Date | null = null;
      isActive = true;
      createdAt = new Date();
      updatedAt = new Date();
    };
  }

  protected getEntityName(): string {
    return 'TestEntity';
  }

  protected getSearchFields(): string[] {
    return ['title'];
  }

  protected getFilterableFields(): string[] {
    return ['isActive'];
  }

  protected getColumnFiltersConfig() {
    return {
      isActive: { type: 'boolean', path: 'isActive' },
    };
  }
}

describe('BaseCrudService', () => {
  let service: TestCrudService;
  let em: jest.Mocked<Partial<EntityManager>>;
  const now = new Date();
  const sampleEntity = {
    id: 1,
    title: 'Test Entity',
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    em = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      nativeUpdate: jest.fn(),
      remove: jest.fn(),
    };
    service = new TestCrudService(em);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns paginated result', async () => {
      (em.find as jest.Mock).mockResolvedValue([sampleEntity]);
      (em.count as jest.Mock).mockResolvedValue(1);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Entity');
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('applies status active filter by default', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10 });

      const where = (em.find as jest.Mock).mock.calls[0][1] as Record<string, unknown>;
      expect(where.deletedAt).toBeNull();
    });

    it('applies status deleted filter', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'deleted' });

      const where = (em.find as jest.Mock).mock.calls[0][1] as Record<string, unknown>;
      expect(where.deletedAt).toEqual({ $ne: null });
    });

    it('applies search filter', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, search: 'test' });

      const where = (em.find as jest.Mock).mock.calls[0][1] as Record<string, unknown>;
      expect(where.$or).toBeDefined();
      expect((where.$or as Array<Record<string, unknown>>)[0]).toEqual({
        title: { $like: '%test%' },
      });
    });

    it('applies column filters', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);

      await service.list({
        page: 1,
        limit: 10,
        filters: { isActive: 'true' },
      });

      const where = (em.find as jest.Mock).mock.calls[0][1] as Record<string, unknown>;
      expect(where.isActive).toBe(true);
    });
  });

  describe('getById', () => {
    it('returns mapped row when found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(sampleEntity);

      const result = await service.getById('1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Test Entity');
    });

    it('returns null when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('persists and returns new entity', async () => {
      const created = { ...sampleEntity, id: 2, title: 'New Entity' };
      (em.persist as jest.Mock).mockImplementation(() => undefined);
      (em.flush as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create({ title: 'New Entity' } as Record<string, unknown>);

      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
      expect(result.title).toBe('New Entity');
    });
  });

  describe('update', () => {
    it('updates and returns entity when found', async () => {
      const existing = { ...sampleEntity };
      (em.findOne as jest.Mock).mockResolvedValue(existing);
      (em.flush as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update('1', { title: 'Updated' } as Record<string, unknown>);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Updated');
    });

    it('returns null when entity not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.update('999', {} as Record<string, unknown>);

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('returns true when update succeeds', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(1);

      const result = await service.softDelete('1');

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });

    it('returns false when no rows affected', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(0);

      const result = await service.softDelete('999');

      expect(result).toBe(false);
    });

    it('returns false when softDeleteField returns null', async () => {
      class NoSoftDeleteService extends BaseCrudService {
        constructor(e: Partial<EntityManager>) {
          super('NoSoftDelete');
        }
        protected getEm(): EntityManager { return e as EntityManager; }
        protected getEntity(): new () => Record<string, unknown> { return class X {}; }
        protected getEntityName(): string { return 'X'; }
        protected getSoftDeleteField(): string | null { return null; }
      }
      const noSdService = new NoSoftDeleteService(em);

      const result = await noSdService.softDelete('1');

      expect(result).toBe(false);
    });
  });

  describe('restore', () => {
    it('returns true when update succeeds', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(1);

      const result = await service.restore('1');

      expect(result).toBe(true);
      expect(em.nativeUpdate).toHaveBeenCalled();
    });

    it('returns false when no rows affected', async () => {
      (em.nativeUpdate as jest.Mock).mockResolvedValue(0);

      const result = await service.restore('999');

      expect(result).toBe(false);
    });

    it('returns false when softDeleteField returns null', async () => {
      class NoSoftDeleteService extends BaseCrudService {
        constructor(e: Partial<EntityManager>) {
          super('NoSoftDelete');
        }
        protected getEm(): EntityManager { return e as EntityManager; }
        protected getEntity(): new () => Record<string, unknown> { return class X {}; }
        protected getEntityName(): string { return 'X'; }
        protected getSoftDeleteField(): string | null { return null; }
      }
      const noSdService = new NoSoftDeleteService(em);

      const result = await noSdService.restore('1');

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('removes and flushes when found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(sampleEntity);
      (em.remove as jest.Mock).mockImplementation(() => undefined);
      (em.flush as jest.Mock).mockResolvedValue(undefined);

      const result = await service.hardDelete('1');

      expect(result).toBe(true);
      expect(em.remove).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });

    it('returns false when not found', async () => {
      (em.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.hardDelete('999');

      expect(result).toBe(false);
    });
  });

  describe('bulk', () => {
    it('throws when ids is empty', async () => {
      await expect(service.bulk('delete', [])).rejects.toThrow(BadRequestException);
    });

    it('throws when action is invalid', async () => {
      await expect(service.bulk('invalid' as never, ['1'])).rejects.toThrow(BadRequestException);
    });
  });

  describe('validate hooks', () => {
    it('validateCreate does not throw by default', () => {
      expect(() => service['validateCreate']({} as never)).not.toThrow();
    });

    it('validateUpdate does not throw by default', () => {
      expect(() => service['validateUpdate'](1, {} as never)).not.toThrow();
    });

    it('beforeCreate returns data as-is by default', async () => {
      const data = { title: 'test' };
      const result = await service['beforeCreate'](data as never);
      expect(result).toEqual(data);
    });

    it('beforeUpdate returns data as-is by default', async () => {
      const data = { title: 'test' };
      const result = await service['beforeUpdate'](1, data as never);
      expect(result).toEqual(data);
    });
  });

  describe('pagination normalization', () => {
    it('enforces max limit of 1000', () => {
      const result = service['normalizePageLimit'](1, 5000);
      expect(result.limit).toBe(1000);
    });

    it('defaults page to 1 when undefined', () => {
      const result = service['normalizePageLimit'](undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
