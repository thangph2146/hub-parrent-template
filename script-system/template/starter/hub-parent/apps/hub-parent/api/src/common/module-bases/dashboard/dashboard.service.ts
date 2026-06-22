/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { EntityManager } from '@mikro-orm/core';
import { toEntityIdList } from '../../entity-id';
import type {
  DashboardStatsDto,
  DashboardOverviewDto,
  DashboardMonthlyItemDto,
  DashboardCategoryItemDto,
  DashboardTopPostDto,
} from './dashboard.types';

export abstract class BaseDashboardService {
  protected abstract getEm(): EntityManager;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getPostEntity(): new () => Record<string, unknown>;
  protected abstract getPostCategoryEntity(): new () => Record<string, unknown>;

  async getStats(): Promise<DashboardStatsDto> {
    const em = this.getEm();
    const connection = em.getConnection();

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalCategories,
      totalTags,
      totalMessages,
      totalNotifications,
      totalContactRequests,
      totalStudents,
      totalSessions,
      totalRoles,
    ] = await Promise.all([
      this.countActive(connection, 'users'),
      this.countActive(connection, 'posts'),
      this.countActive(connection, 'comments'),
      this.countActive(connection, 'categories'),
      this.countActive(connection, 'tags'),
      this.countActive(connection, 'messages'),
      this.countActiveWhere(connection, 'notifications', '1=1'),
      this.countActive(connection, 'contact_requests'),
      this.countActive(connection, 'students'),
      this.countActiveWhere(connection, 'sessions', 'isActive = true'),
      this.countActive(connection, 'roles'),
    ]);

    const overview: DashboardOverviewDto = {
      totalUsers,
      totalPosts,
      totalComments,
      totalCategories,
      totalTags,
      totalMessages,
      totalNotifications,
      totalContactRequests,
      totalStudents,
      totalSessions,
      totalRoles,
      usersChange: 0,
      postsChange: 0,
      commentsChange: 0,
      categoriesChange: 0,
      tagsChange: 0,
      messagesChange: 0,
      notificationsChange: 0,
      contactRequestsChange: 0,
      studentsChange: 0,
      sessionsChange: 0,
      rolesChange: 0,
    };

    const [monthlyData, categoryData, topPosts] = await Promise.all([
      this.getMonthlyData(connection),
      this.getCategoryData(),
      this.getTopPosts(connection),
    ]);

    return { overview, monthlyData, categoryData, topPosts };
  }

  private async countActive(
    connection: ReturnType<EntityManager['getConnection']>,
    table: string,
  ): Promise<number> {
    return this.countActiveWhere(connection, table, 'deletedAt IS NULL');
  }

  private async countActiveWhere(
    connection: ReturnType<EntityManager['getConnection']>,
    table: string,
    whereClause: string,
  ): Promise<number> {
    const rows = await connection.execute(
      `SELECT COUNT(*) AS cnt FROM \`${table}\` WHERE ${whereClause}`,
    );
    return Number((rows as Array<Record<string, unknown>>)[0]?.cnt ?? 0);
  }

  private async getMonthlyData(
    connection: ReturnType<EntityManager['getConnection']>,
  ): Promise<DashboardMonthlyItemDto[]> {
    const now = new Date();
    const twelveMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
    );

    const rows = (await connection.execute(
      `
      WITH RECURSIVE months AS (
        SELECT DATE_FORMAT(?, '%Y-%m') AS month
        UNION ALL
        SELECT DATE_FORMAT(DATE_ADD(STR_TO_DATE(CONCAT(month, '-01'), '%Y-%m-%d'), INTERVAL 1 MONTH), '%Y-%m')
        FROM months
        WHERE month < DATE_FORMAT(?, '%Y-%m')
      )
      SELECT
        m.month,
        COALESCE(u.cnt, 0) AS users,
        COALESCE(p.cnt, 0) AS posts,
        COALESCE(co.cnt, 0) AS comments,
        COALESCE(ca.cnt, 0) AS categories,
        COALESCE(t.cnt, 0) AS tags,
        COALESCE(me.cnt, 0) AS messages,
        COALESCE(n.cnt, 0) AS notifications,
        COALESCE(cr.cnt, 0) AS contactRequests,
        COALESCE(s.cnt, 0) AS students,
        COALESCE(se.cnt, 0) AS sessions,
        COALESCE(r.cnt, 0) AS roles
      FROM months m
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM users WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) u ON u.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM posts WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) p ON p.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM comments WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) co ON co.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM categories WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) ca ON ca.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM tags WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) t ON t.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM messages WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) me ON me.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM notifications WHERE createdAt >= ? GROUP BY month) n ON n.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM contact_requests WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) cr ON cr.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM students WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) s ON s.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM sessions WHERE isActive = true AND createdAt >= ? GROUP BY month) se ON se.month = m.month
      LEFT JOIN (SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt FROM roles WHERE deletedAt IS NULL AND createdAt >= ? GROUP BY month) r ON r.month = m.month
      ORDER BY m.month ASC
      `,
      [
        twelveMonthsAgo,
        now,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
        twelveMonthsAgo,
      ],
    )) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      month: String(row.month ?? ''),
      users: Number(row.users ?? 0),
      posts: Number(row.posts ?? 0),
      comments: Number(row.comments ?? 0),
      categories: Number(row.categories ?? 0),
      tags: Number(row.tags ?? 0),
      messages: Number(row.messages ?? 0),
      notifications: Number(row.notifications ?? 0),
      contactRequests: Number(row.contactRequests ?? 0),
      students: Number(row.students ?? 0),
      sessions: Number(row.sessions ?? 0),
      roles: Number(row.roles ?? 0),
    }));
  }

  protected async getCategoryData(): Promise<DashboardCategoryItemDto[]> {
    const em = this.getEm();
    const Category = this.getCategoryEntity();
    const Post = this.getPostEntity();
    const PostCategory = this.getPostCategoryEntity();

    const [totalPosts, allCategories, activePosts] = await Promise.all([
      em.count(Post, { deletedAt: null }),
      em.find(
        Category,
        { deletedAt: null },
        {
          fields: ['id', 'name', 'parent'],
          orderBy: { name: 'ASC' },
        },
      ),
      em.find(Post, { deletedAt: null }, { fields: ['id'] }),
    ]);

    type CategoryRow = { id: number; name: string; parent?: { id: number } | null };
    const categories = allCategories as CategoryRow[];
    const activePostIds = (activePosts as Array<{ id: number }>).map((p) => p.id);
    const postCategoryRows = await em.find(
      PostCategory,
      { post: { id: { $in: toEntityIdList(activePostIds) } } },
      { fields: ['post', 'category'] },
    );

    const byParent = new Map<number | null, CategoryRow[]>();
    for (const category of categories) {
      const key = category.parent?.id ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)?.push(category);
    }

    const depth = new Map<number, number>();
    const setDepth = (id: number, currentDepth: number) => {
      depth.set(id, currentDepth);
      for (const child of byParent.get(id) ?? []) {
        setDepth(child.id, currentDepth + 1);
      }
    };

    for (const root of byParent.get(null) ?? []) {
      setDepth(root.id, 0);
    }

    const postToCategoryIds = new Map<number, number[]>();
    for (const row of postCategoryRows as Array<{
      post: { id: number };
      category: { id: number };
    }>) {
      const pid = row.post.id;
      const cid = row.category.id;
      if (!postToCategoryIds.has(pid)) {
        postToCategoryIds.set(pid, []);
      }
      postToCategoryIds.get(pid)?.push(cid);
    }

    const assignedCount = new Map<number, number>();
    for (const [, categoryIds] of postToCategoryIds) {
      if (!categoryIds.length) continue;

      const deepestId = categoryIds.reduce((current, next) =>
        (depth.get(next) ?? 0) > (depth.get(current) ?? 0) ? next : current,
      );

      assignedCount.set(deepestId, (assignedCount.get(deepestId) ?? 0) + 1);
    }

    const buildNode = (category: CategoryRow): DashboardCategoryItemDto => {
      const childrenRaw = byParent.get(category.id) ?? [];
      const children = childrenRaw.length
        ? childrenRaw.map((child) => buildNode(child))
        : undefined;
      const directCount = assignedCount.get(category.id) ?? 0;
      const childSum =
        children?.reduce((sum, child) => sum + child.count, 0) ?? 0;
      const count = directCount + childSum;
      const value = totalPosts > 0 ? (count / totalPosts) * 100 : 0;

      return {
        name: category.name,
        value: Math.round(value * 10) / 10,
        count,
        children: children?.length ? children : undefined,
      };
    };

    return (byParent.get(null) ?? []).map((root) => buildNode(root));
  }

  protected async getTopPosts(
    connection: ReturnType<EntityManager['getConnection']>,
    limit = 10,
  ): Promise<DashboardTopPostDto[]> {
    const rows = (await connection.execute(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        COUNT(c.id) AS comments
      FROM posts p
      LEFT JOIN comments c ON c.postId = p.id AND c.deletedAt IS NULL
      WHERE p.deletedAt IS NULL
      GROUP BY p.id, p.title, p.slug
      ORDER BY comments DESC
      LIMIT ?
      `,
      [limit],
    )) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: typeof row.id === 'number' ? row.id : Number(row.id ?? 0) || 0,
      title: String(row.title ?? ''),
      slug: String(row.slug ?? ''),
      comments: Number(row.comments ?? 0),
    }));
  }
}
