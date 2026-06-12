import { EntityManager } from '@mikro-orm/core';
import { BaseDashboardService } from './dashboard.service';
import type {
  DashboardStatsDto,
  DashboardMonthlyItemDto,
  DashboardTopPostDto,
} from './dashboard.types';

describe('BaseDashboardService', () => {
  let service: BaseDashboardService;
  let mockExecute: jest.Mock;
  let mockConnection: { execute: jest.Mock };
  let mockEm: Partial<EntityManager>;

  class TestDashboardService extends BaseDashboardService {
    protected getEm(): EntityManager {
      return mockEm as EntityManager;
    }
  }

  beforeEach(() => {
    mockExecute = jest.fn();
    mockConnection = { execute: mockExecute };
    mockEm = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
    };
    service = new TestDashboardService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('returns valid DashboardStatsDto shape', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('WITH RECURSIVE months')) {
          return Promise.resolve([
            {
              month: '2026-01',
              users: 2,
              posts: 3,
              comments: 1,
              categories: 0,
              tags: 0,
              messages: 0,
              notifications: 0,
              contactRequests: 0,
              students: 0,
              sessions: 0,
              roles: 0,
            },
          ]);
        }
        if (sql.includes('LEFT JOIN comments')) {
          return Promise.resolve([
            { id: '1', title: 'Post A', slug: 'post-a', comments: 10 },
          ]);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('COUNT(*)') &&
          sql.includes('FROM')
        ) {
          return Promise.resolve([{ cnt: 5 }]);
        }
        return Promise.resolve([]);
      });

      const result: DashboardStatsDto = await service.getStats();

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.overview.totalUsers).toBe(5);
      expect(result.overview.totalPosts).toBe(5);
      expect(result.overview.totalComments).toBe(5);
      expect(result.overview.totalCategories).toBe(5);
      expect(result.overview.totalTags).toBe(5);
      expect(result.overview.totalMessages).toBe(5);
      expect(result.overview.totalNotifications).toBe(5);
      expect(result.overview.totalContactRequests).toBe(5);
      expect(result.overview.totalStudents).toBe(5);
      expect(result.overview.totalSessions).toBe(5);
      expect(result.overview.totalRoles).toBe(5);
      expect(result.overview.usersChange).toBe(0);
      expect(result.overview.postsChange).toBe(0);

      expect(Array.isArray(result.monthlyData)).toBe(true);
      expect(result.monthlyData).toHaveLength(1);
      expect(result.monthlyData[0].month).toBe('2026-01');
      expect(result.monthlyData[0].users).toBe(2);

      expect(Array.isArray(result.categoryData)).toBe(true);
      expect(Array.isArray(result.topPosts)).toBe(true);
      expect(result.topPosts).toHaveLength(1);
      expect(result.topPosts[0].title).toBe('Post A');
    });

    it('calls countActive for all tables via connection.execute', async () => {
      mockExecute.mockResolvedValue([{ cnt: 3 }]);

      await service.getStats();

      const countCalls = mockExecute.mock.calls.filter(
        ([sql]: [string]) => typeof sql === 'string' && sql.includes('COUNT(*)'),
      );
      expect(countCalls.length).toBeGreaterThanOrEqual(11);

      const tables = [
        'users', 'posts', 'comments', 'categories', 'tags',
        'messages', 'contact_requests', 'students', 'roles',
      ];
      for (const table of tables) {
        expect(countCalls.some(([sql]: [string]) => sql.includes(`FROM \`${table}\``))).toBe(true);
      }
    });

    it('calls countActiveWhere for notifications and sessions', async () => {
      mockExecute.mockResolvedValue([{ cnt: 3 }]);

      await service.getStats();

      const calls = mockExecute.mock.calls.map(([sql]: [string]) => sql);
      const hasNotifications = calls.some(
        (sql: string) => sql.includes('FROM `notifications`') && sql.includes('1=1'),
      );
      const hasSessions = calls.some(
        (sql: string) => sql.includes('FROM `sessions`') && sql.includes('isActive'),
      );
      expect(hasNotifications).toBe(true);
      expect(hasSessions).toBe(true);
    });

    it('returns empty arrays for monthlyData when no data', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('WITH RECURSIVE months')) {
          return Promise.resolve([]);
        }
        if (sql.includes('LEFT JOIN comments')) {
          return Promise.resolve([]);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('COUNT(*)') &&
          sql.includes('FROM')
        ) {
          return Promise.resolve([{ cnt: 0 }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getStats();

      expect(result.monthlyData).toEqual([]);
      expect(result.topPosts).toEqual([]);
      expect(result.categoryData).toEqual([]);
    });

    it('handles zero cnt from countActiveWhere', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('WITH RECURSIVE months')) {
          return Promise.resolve([]);
        }
        if (sql.includes('LEFT JOIN comments')) {
          return Promise.resolve([]);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('COUNT(*)') &&
          sql.includes('FROM')
        ) {
          return Promise.resolve([{ cnt: 0 }]);
        }
        return Promise.resolve([{ cnt: 0 }]);
      });

      const result = await service.getStats();

      expect(result.overview.totalUsers).toBe(0);
      expect(result.overview.totalPosts).toBe(0);
    });

    it('handles missing cnt field gracefully', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('WITH RECURSIVE months')) {
          return Promise.resolve([]);
        }
        if (sql.includes('LEFT JOIN comments')) {
          return Promise.resolve([]);
        }
        if (
          typeof sql === 'string' &&
          sql.includes('COUNT(*)') &&
          sql.includes('FROM')
        ) {
          return Promise.resolve([{}]);
        }
        return Promise.resolve([{}]);
      });

      const result = await service.getStats();

      expect(result.overview.totalUsers).toBe(0);
    });
  });
});
