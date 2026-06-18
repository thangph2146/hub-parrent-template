/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * PageContentsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { PageContentsService } from './page-contents.service';

describe('PageContentsService', () => {
  let service: PageContentsService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    em = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      persistAndFlush: jest.fn().mockResolvedValue(undefined),
      removeAndFlush: jest.fn().mockResolvedValue(undefined),
      nativeUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageContentsService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<PageContentsService>(PageContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated rows', async () => {
      (em.find as jest.Mock).mockResolvedValue([]);
      (em.count as jest.Mock).mockResolvedValue(0);
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
