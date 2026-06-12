import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { BaseDashboardController } from './dashboard.controller';
import type { DashboardStatsDto } from './dashboard.types';

const VERB_MAP: Record<number, string> = {
  [RequestMethod.GET]: 'GET',
};

function getRoutes(controller: BaseDashboardController): { method: string; path: string; handler: string }[] {
  const routes: { method: string; path: string; handler: string }[] = [];
  let proto = Object.getPrototypeOf(controller);
  while (proto && proto !== Object.prototype) {
    const methods = Object.getOwnPropertyNames(proto).filter(
      (k) => k !== 'constructor' && typeof (proto as Record<string, unknown>)[k] === 'function',
    );
    for (const key of methods) {
      const fn = proto[key as keyof typeof proto];
      const method = Reflect.getMetadata(METHOD_METADATA, fn);
      const path = Reflect.getMetadata(PATH_METADATA, fn);
      if (method !== undefined) {
        routes.push({
          method: VERB_MAP[method] ?? 'UNKNOWN',
          path: path ?? '/',
          handler: key,
        });
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return routes;
}

const dummyStats: DashboardStatsDto = {
  overview: {
    totalUsers: 100,
    totalPosts: 50,
    totalComments: 200,
    totalCategories: 10,
    totalTags: 20,
    totalMessages: 30,
    totalNotifications: 40,
    totalContactRequests: 5,
    totalStudents: 300,
    totalSessions: 25,
    totalRoles: 4,
    usersChange: 5,
    postsChange: -2,
    commentsChange: 10,
    categoriesChange: 0,
    tagsChange: 1,
    messagesChange: 3,
    notificationsChange: -1,
    contactRequestsChange: 2,
    studentsChange: 15,
    sessionsChange: 0,
    rolesChange: 0,
  },
  monthlyData: [{ month: '2026-01', users: 10, posts: 5, comments: 20, categories: 2, tags: 3, messages: 4, notifications: 6, contactRequests: 1, students: 30, sessions: 3, roles: 0 }],
  categoryData: [{ name: 'Danh mục A', value: 5, count: 15 }],
  topPosts: [{ id: '1', title: 'Bài viết A', slug: 'bai-viet-a', comments: 8 }],
};

describe('BaseDashboardController — client contract', () => {
  let service: { getStats: jest.Mock };
  let controller: BaseDashboardController;

  beforeEach(() => {
    service = { getStats: jest.fn(async () => dummyStats) };
    controller = new BaseDashboardController(service as never);
  });

  describe('route metadata (api-client contract)', () => {
    it('exposes route metadata theo contract dashboard', () => {
      const routes = getRoutes(controller);
      expect(routes).toEqual(
        expect.arrayContaining([
          { method: 'GET', path: 'stats', handler: 'getStats' },
        ]),
      );
    });
  });

  describe('envelope contract (api-client.unwrapApiEnvelope)', () => {
    it('getStats trả về success envelope với DashboardStatsDto', async () => {
      const result = await controller.getStats();
      expect(service.getStats).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(expect.any(String));
      expect(result.error).toBeNull();
      expect(result.data).toEqual(dummyStats);
      expect(result.data.overview).toBeDefined();
      expect(result.data.monthlyData).toEqual(expect.any(Array));
      expect(result.data.categoryData).toEqual(expect.any(Array));
      expect(result.data.topPosts).toEqual(expect.any(Array));
    });
  });

  describe('error contract', () => {
    it('service lỗi được lan truyền ra controller', async () => {
      const testError = new Error('DB connection failed');
      service.getStats.mockRejectedValueOnce(testError);
      await expect(controller.getStats()).rejects.toThrow('DB connection failed');
    });
  });
});
