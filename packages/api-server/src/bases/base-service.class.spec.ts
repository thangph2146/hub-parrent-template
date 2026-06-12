import { BaseService } from './base-service.class';
import type { ListQueryParams, PaginatedResult } from '../types';

interface TestEntity {
  id: number;
  name: string;
  createdAt: Date;
}

interface TestListParams extends ListQueryParams {
  search?: string;
  status?: 'active' | 'deleted' | 'all';
}

class TestServiceImpl extends BaseService<TestEntity, TestListParams> {
  private mockFind: jest.Mock;
  private mockCount: jest.Mock;

  constructor(find: jest.Mock, count: jest.Mock) {
    super('TestService');
    this.mockFind = find;
    this.mockCount = count;
  }

  protected buildWhere(_params: TestListParams): Record<string, unknown> {
    return {};
  }

  protected mapToDto(entity: TestEntity): { id: number; name: string } {
    return { id: entity.id, name: entity.name };
  }

  protected getEntityName(): string {
    return 'TestEntity';
  }

  protected getEntityManager(): { find: Function; count: Function } {
    return {
      find: this.mockFind,
      count: this.mockCount,
    };
  }

  callNormalizePageLimit(page: number, limit: number, maxLimit?: number) {
    return this.normalizePageLimit(page, limit, maxLimit);
  }

  callBuildPaginationMeta(page: number, limit: number, total: number) {
    return this.buildPaginationMeta(page, limit, total);
  }

  callBuildSearchFilter(search: string | undefined, fields: string[]) {
    return this.buildSearchFilter(search, fields);
  }

  callBuildStatusFilter(status: 'active' | 'deleted' | 'all' | undefined) {
    return this.buildStatusFilter(status);
  }
}

describe('BaseService', () => {
  let mockFind: jest.Mock;
  let mockCount: jest.Mock;
  let service: TestServiceImpl;

  const sampleEntities: TestEntity[] = [
    { id: 1, name: 'Entity A', createdAt: new Date('2026-01-01') },
    { id: 2, name: 'Entity B', createdAt: new Date('2026-02-01') },
  ];

  beforeEach(() => {
    mockFind = jest.fn();
    mockCount = jest.fn();
    service = new TestServiceImpl(mockFind, mockCount);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns paginated result with mapped DTOs', async () => {
      mockFind.mockResolvedValue(sampleEntities);
      mockCount.mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ id: 1, name: 'Entity A' });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('passes orderBy and populate options', async () => {
      mockFind.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await service.list(
        { page: 1, limit: 10 },
        { orderBy: { name: 'ASC' as const }, populate: ['relation'] },
      );

      const options = mockFind.mock.calls[0][2] as Record<string, unknown>;
      expect(options.orderBy).toEqual({ name: 'ASC' });
      expect(options.populate).toEqual(['relation']);
    });

    it('uses custom defaultLimit from options', async () => {
      mockFind.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await service.list(
        { page: 1 } as TestListParams,
        { defaultLimit: 25 },
      );

      const options = mockFind.mock.calls[0][2] as Record<string, unknown>;
      expect(options.limit).toBe(25);
    });

    it('enforces maxLimit from options', async () => {
      mockFind.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await service.list(
        { page: 1, limit: 500 } as TestListParams,
        { maxLimit: 100 },
      );

      const options = mockFind.mock.calls[0][2] as Record<string, unknown>;
      expect(options.limit).toBe(100);
    });

    it('calls mockFind with entity name and where clause', async () => {
      mockFind.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await service.list({ page: 1, limit: 10 });

      expect(mockFind.mock.calls[0][0]).toBe('TestEntity');
      expect(mockFind.mock.calls[0][1]).toEqual({});
    });

    it('calls buildWhere to construct where clause', async () => {
      const whereSpy = jest.spyOn(service as unknown as { buildWhere: Function }, 'buildWhere');
      mockFind.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await service.list({ page: 2, limit: 20, search: 'foo', status: 'all' });

      expect(whereSpy).toHaveBeenCalledWith({ page: 2, limit: 20, search: 'foo', status: 'all' });
    });
  });

  describe('normalizePageLimit', () => {
    it('normalizes page and limit', () => {
      const result = service.callNormalizePageLimit(2, 15);
      expect(result).toEqual({ page: 2, limit: 15, skip: 15 });
    });

    it('enforces maxLimit', () => {
      const result = service.callNormalizePageLimit(1, 500, 50);
      expect(result.limit).toBe(50);
    });

    it('ensures minimum page of 1', () => {
      expect(service.callNormalizePageLimit(0, 10).page).toBe(1);
      expect(service.callNormalizePageLimit(-5, 10).page).toBe(1);
    });

    it('ensures minimum limit of 1', () => {
      expect(service.callNormalizePageLimit(1, -5).limit).toBe(1);
      expect(service.callNormalizePageLimit(1, -1).limit).toBe(1);
    });

    it('calculates skip correctly', () => {
      expect(service.callNormalizePageLimit(3, 20)).toEqual({
        page: 3,
        limit: 20,
        skip: 40,
      });
    });
  });

  describe('buildPaginationMeta', () => {
    it('builds correct meta with exact pages', () => {
      const result = service.callBuildPaginationMeta(1, 10, 30);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 30,
        totalPages: 3,
      });
    });

    it('rounds up totalPages', () => {
      const result = service.callBuildPaginationMeta(1, 10, 25);
      expect(result.totalPages).toBe(3);
    });

    it('handles zero total', () => {
      const result = service.callBuildPaginationMeta(1, 10, 0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('buildSearchFilter', () => {
    it('returns undefined when search is empty', () => {
      expect(service.callBuildSearchFilter(undefined, ['name'])).toBeUndefined();
      expect(service.callBuildSearchFilter('', ['name'])).toBeUndefined();
      expect(service.callBuildSearchFilter('   ', ['name'])).toBeUndefined();
    });

    it('builds $or with LIKE conditions', () => {
      const result = service.callBuildSearchFilter('test', ['name', 'email']);
      expect(result).toEqual({
        $or: [
          { name: { $like: '%test%' } },
          { email: { $like: '%test%' } },
        ],
      });
    });
  });

  describe('buildStatusFilter', () => {
    it('returns deletedAt null for active status', () => {
      expect(service.callBuildStatusFilter('active')).toEqual({ deletedAt: null });
    });

    it('returns deletedAt null when status is undefined', () => {
      expect(service.callBuildStatusFilter(undefined)).toEqual({ deletedAt: null });
    });

    it('returns deletedAt $ne null for deleted status', () => {
      expect(service.callBuildStatusFilter('deleted')).toEqual({ deletedAt: { $ne: null } });
    });

    it('returns empty object for all status', () => {
      expect(service.callBuildStatusFilter('all')).toEqual({});
    });
  });
});
