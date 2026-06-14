/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * PublicCategoriesService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { PublicCategoriesService } from './public-categories.service';

describe('PublicCategoriesService', () => {
  let service: PublicCategoriesService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    em = {
      find: jest.fn().mockResolvedValue([]),
      getConnection: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicCategoriesService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<PublicCategoriesService>(PublicCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return empty list when no categories', async () => {
      expect(await service.getCategories()).toEqual([]);
    });
  });
});
