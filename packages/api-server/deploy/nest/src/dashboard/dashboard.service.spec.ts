/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * DashboardService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    const execute = jest.fn().mockResolvedValue([{ cnt: 3 }]);
    em = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      getConnection: jest.fn().mockReturnValue({ execute }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard stats', async () => {
      const stats = await service.getStats();
      expect(stats.overview.totalUsers).toBe(3);
      expect(stats.monthlyData).toBeDefined();
      expect(stats.categoryData).toBeDefined();
      expect(stats.topPosts).toBeDefined();
    });
  });
});
