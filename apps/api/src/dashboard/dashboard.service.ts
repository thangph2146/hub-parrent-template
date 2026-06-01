/**
 * Dashboard stats for admin: overview counts, monthlyData, categoryData, topPosts.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { PostCategory } from '../entities/post-category.entity';
import { Post } from '../entities/post.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { Student } from '../entities/student.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

export interface DashboardOverviewDto {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalCategories: number;
  totalTags: number;
  totalMessages: number;
  totalNotifications: number;
  totalContactRequests: number;
  totalStudents: number;
  totalSessions: number;
  totalRoles: number;
  usersChange: number;
  postsChange: number;
  commentsChange: number;
  categoriesChange: number;
  tagsChange: number;
  messagesChange: number;
  notificationsChange: number;
  contactRequestsChange: number;
  studentsChange: number;
  sessionsChange: number;
  rolesChange: number;
}

export interface DashboardMonthlyItemDto {
  month: string;
  users: number;
  posts: number;
  comments: number;
  categories: number;
  tags: number;
  messages: number;
  notifications: number;
  contactRequests: number;
  students: number;
  sessions: number;
  roles: number;
}

export interface DashboardCategoryItemDto {
  name: string;
  value: number;
  count: number;
  children?: DashboardCategoryItemDto[];
}

export interface DashboardTopPostDto {
  id: string;
  title: string;
  slug: string;
  comments: number;
}

export interface DashboardStatsDto {
  overview: DashboardOverviewDto;
  monthlyData: DashboardMonthlyItemDto[];
  categoryData: DashboardCategoryItemDto[];
  topPosts: DashboardTopPostDto[];
}

const ZERO_CHANGE = {
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

@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  async getStats(): Promise<DashboardStatsDto> {
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
      this.em.count(User, { deletedAt: null }),
      this.em.count(Post, { deletedAt: null }),
      this.em.count(Comment, { deletedAt: null }),
      this.em.count(Category, { deletedAt: null }),
      this.em.count(Tag, { deletedAt: null }),
      this.em.count(Message, { deletedAt: null }),
      this.em.count(Notification, {}),
      this.em.count(ContactRequest, { deletedAt: null }),
      this.em.count(Student, { deletedAt: null }),
      this.em.count(Session, { isActive: true }),
      this.em.count(Role, { deletedAt: null }),
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
      ...ZERO_CHANGE,
    };

    const [monthlyData, categoryData, topPosts] = await Promise.all([
      this.getMonthlyData(),
      this.getCategoryData(),
      this.getTopPosts(),
    ]);

    return {
      overview,
      monthlyData,
      categoryData,
      topPosts,
    };
  }

  private async getMonthlyData(): Promise<DashboardMonthlyItemDto[]> {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    interface MonthlyRow {
      month: string;
      users: number;
      posts: number;
      comments: number;
      categories: number;
      tags: number;
      messages: number;
      notifications: number;
      contactRequests: number;
      students: number;
      sessions: number;
      roles: number;
    }

    const raw = (await this.em.getConnection().execute(
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
      ],
    )) as MonthlyRow[];

    return raw;
  }

  private async getCategoryData(): Promise<DashboardCategoryItemDto[]> {
    const [totalPosts, allCategories, activePosts] = await Promise.all([
      this.em.count(Post, { deletedAt: null }),
      this.em.find(
        Category,
        { deletedAt: null },
        {
          fields: ['id', 'name', 'parent'],
          orderBy: { name: 'ASC' },
        },
      ),
      this.em.find(Post, { deletedAt: null }, { fields: ['id'] }),
    ]);
    const activePostIds = activePosts.map((p) => p.id);
    const postCategoryRows = await this.em.find(
      PostCategory,
      { post: { id: { $in: activePostIds } } },
      { fields: ['post', 'category'] },
    );

    const byParent = new Map<string | null, typeof allCategories>();
    for (const category of allCategories) {
      const key = category.parent?.id ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)?.push(category);
    }

    const depth = new Map<string, number>();
    const setDepth = (id: string, currentDepth: number) => {
      depth.set(id, currentDepth);
      for (const child of byParent.get(id) ?? []) {
        setDepth(child.id, currentDepth + 1);
      }
    };

    for (const root of byParent.get(null) ?? []) {
      setDepth(root.id, 0);
    }

    const postToCategoryIds = new Map<string, string[]>();
    for (const row of postCategoryRows) {
      const pid = row.post.id;
      const cid = row.category.id;
      if (!postToCategoryIds.has(pid)) {
        postToCategoryIds.set(pid, []);
      }
      postToCategoryIds.get(pid)?.push(cid);
    }

    const assignedCount = new Map<string, number>();
    for (const [, categoryIds] of postToCategoryIds) {
      if (!categoryIds.length) continue;

      const deepestId = categoryIds.reduce((current, next) =>
        (depth.get(next) ?? 0) > (depth.get(current) ?? 0) ? next : current,
      );

      assignedCount.set(deepestId, (assignedCount.get(deepestId) ?? 0) + 1);
    }

    const buildNode = (category: {
      id: string;
      name: string;
      parentId?: string | null;
    }): DashboardCategoryItemDto => {
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

  private async getTopPosts(limit = 10): Promise<DashboardTopPostDto[]> {
    const rows = (await this.em.getConnection().execute(
      `
      SELECT
        p.id AS id,
        p.title AS title,
        p.slug AS slug,
        COUNT(c.id) AS comments
      FROM posts p
      LEFT JOIN comments c
        ON c.postId = p.id
       AND c.deletedAt IS NULL
      WHERE p.deletedAt IS NULL
      GROUP BY p.id, p.title, p.slug
      ORDER BY comments DESC
      LIMIT ?
      `,
      [limit],
    )) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      title: typeof row.title === 'string' ? row.title : '',
      slug: typeof row.slug === 'string' ? row.slug : '',
      comments:
        typeof row.comments === 'number'
          ? row.comments
          : Number(row.comments ?? 0) || 0,
    }));
  }
}
