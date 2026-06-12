/**
 * Comments admin service — logic dùng chung; app binding entity.
 * App binding: extend BaseCommentsAdminService + wire Comment entity.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../common/pagination';
import { safeIsoString, safeIsoStringNow } from '../../common/date-utils';
import { toEntityId, toEntityIdList } from '../../common/entity-id';

export interface CommentRowDto {
  id: number;
  content: string;
  approved: boolean;
  authorId: number;
  authorName: string | null;
  authorEmail: string;
  postTitle: string;
  postId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ListCommentsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
}

export interface ListCommentsResult {
  data: CommentRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type CommentWithRelations = {
  id: number;
  content: string;
  approved: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  author?: { id: number; name?: string | null; email?: string };
  post?: { id: number; title?: string };
};

function mapRow(r: CommentWithRelations): CommentRowDto {
  return {
    id: r.id,
    content: r.content,
    approved: r.approved,
    authorId: r.author?.id ?? 0,
    authorName: r.author?.name ?? null,
    authorEmail: r.author?.email ?? '',
    postTitle: r.post?.title ?? '',
    postId: r.post?.id ?? 0,
    createdAt: safeIsoStringNow(r.createdAt),
    updatedAt: safeIsoStringNow(r.updatedAt),
    deletedAt: safeIsoString(r.deletedAt),
  };
}

function buildWhere(params: ListCommentsParams): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const status = params.status ?? 'active';

  if (status === 'deleted') {
    where.deletedAt = { $ne: null };
  } else if (status === 'active') {
    where.deletedAt = null;
  }

  if (params.search?.trim()) {
    const q = `%${params.search.trim()}%`;
    where.$or = [
      { content: { $like: q } },
      { author: { name: { $like: q } } },
      { author: { email: { $like: q } } },
      { post: { title: { $like: q } } },
    ];
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const trimmed = value.trim();

      if (key === 'content') {
        where.content = { $like: `%${trimmed}%` };
      } else if (key === 'authorName') {
        where.author = { name: { $like: `%${trimmed}%` } };
      } else if (key === 'authorEmail') {
        where.author = { email: { $like: `%${trimmed}%` } };
      } else if (key === 'postTitle') {
        where.post = { title: { $like: `%${trimmed}%` } };
      } else if (key === 'postId') {
        where.post = trimmed;
      } else if (key === 'authorId') {
        where.author = trimmed;
      } else if (key === 'approved') {
        where.approved = trimmed === 'true';
      }
    }
  }

  return where;
}

@Injectable()
export abstract class BaseCommentsAdminService {
  protected abstract getEm(): EntityManager;
  protected abstract getCommentEntity(): new () => Record<string, unknown>;

  async list(params: ListCommentsParams): Promise<ListCommentsResult> {
    const Comment = this.getCommentEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildWhere(params) as FilterQuery<object>;

    const [rows, total] = await Promise.all([
      this.getEm().find(Comment, where, {
        populate: ['author', 'post'],
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(Comment, where),
    ]);

    return {
      data: (rows as CommentWithRelations[]).map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    const Comment = this.getCommentEntity();
    const where: Record<string, unknown> = { deletedAt: null };
    if (search?.trim()) {
      const q = search.trim();
      if (column === 'content') where.content = { $like: `%${q}%` };
      else if (column === 'authorName')
        where.author = { name: { $like: `%${q}%` } };
      else if (column === 'authorEmail')
        where.author = { email: { $like: `%${q}%` } };
      else if (column === 'postTitle')
        where.post = { title: { $like: `%${q}%` } };
      else where.content = { $like: `%${q}%` };
    }
    const rows = (await this.getEm().find(
      Comment,
      where as FilterQuery<object>,
      {
        populate: ['author', 'post'],
        limit,
      },
    )) as CommentWithRelations[];

    const optionsMap = new Map<string, string>();
    for (const item of rows) {
      let value: string | null = null;
      let label: string | null = null;

      if (column === 'content') {
        value = item.content;
        label =
          item.content.length > 50
            ? `${item.content.substring(0, 50)}...`
            : item.content;
      } else if (column === 'authorName') {
        value = item.author?.name || item.author?.email || '';
        label = value;
      } else if (column === 'authorEmail') {
        value = item.author?.email || '';
        label = value;
      } else if (column === 'postTitle') {
        value = item.post?.title || '';
        label = value;
      }

      if (value && !optionsMap.has(value)) {
        optionsMap.set(value, label || value);
      }
    }

    return Array.from(optionsMap.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  }

  async getById(id: string): Promise<CommentRowDto | null> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(
      Comment,
      { id: toEntityId(id) },
      { populate: ['author', 'post'] },
    );
    return row ? mapRow(row as CommentWithRelations) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(Comment, { id: toEntityId(id) });
    if (!row || (row as { deletedAt?: Date | null }).deletedAt) return false;

    (row as { deletedAt: Date | null }).deletedAt = new Date();
    this.getEm().persist(row);
    await this.getEm().flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(Comment, { id: toEntityId(id) });
    if (!row || !(row as { deletedAt?: Date | null }).deletedAt) return false;

    (row as { deletedAt: Date | null }).deletedAt = null;
    this.getEm().persist(row);
    await this.getEm().flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(Comment, { id: toEntityId(id) });
    if (!row) return false;

    this.getEm().remove(row);
    await this.getEm().flush();
    return true;
  }

  async approve(id: string): Promise<boolean> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(Comment, { id: toEntityId(id) });
    if (!row || (row as { deletedAt?: Date | null }).deletedAt) return false;

    (row as { approved: boolean }).approved = true;
    this.getEm().persist(row);
    await this.getEm().flush();
    return true;
  }

  async unapprove(id: string): Promise<boolean> {
    const Comment = this.getCommentEntity();
    const row = await this.getEm().findOne(Comment, { id: toEntityId(id) });
    if (!row || (row as { deletedAt?: Date | null }).deletedAt) return false;

    (row as { approved: boolean }).approved = false;
    this.getEm().persist(row);
    await this.getEm().flush();
    return true;
  }

  async bulk(
    action: 'approve' | 'unapprove' | 'delete' | 'restore' | 'hard-delete',
    ids: string[],
  ): Promise<{ affected: number; message: string }> {
    const Comment = this.getCommentEntity();
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };

    if (action === 'approve') {
      const result = await this.getEm().nativeUpdate(
        Comment,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null, approved: false },
        { approved: true },
      );
      return {
        affected: result ?? 0,
        message: `Đã duyệt ${result ?? 0} bình luận`,
      };
    }

    if (action === 'unapprove') {
      const result = await this.getEm().nativeUpdate(
        Comment,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null, approved: true },
        { approved: false },
      );
      return {
        affected: result ?? 0,
        message: `Đã bỏ duyệt ${result ?? 0} bình luận`,
      };
    }

    if (action === 'delete') {
      const result = await this.getEm().nativeUpdate(
        Comment,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} bình luận`,
      };
    }

    if (action === 'restore') {
      const result = await this.getEm().nativeUpdate(
        Comment,
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} bình luận`,
      };
    }

    if (action === 'hard-delete') {
      const result = await this.getEm().nativeDelete(Comment, {
        id: { $in: toEntityIdList(ids) },
      });
      return {
        affected: result ?? 0,
        message: `Đã xóa vĩnh viễn ${result ?? 0} bình luận`,
      };
    }

    return { affected: 0, message: 'Action không hợp lệ' };
  }
}
