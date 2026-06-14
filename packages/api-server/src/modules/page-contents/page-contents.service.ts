/**
 * Page contents admin service — guides/page-contents; app binding entity.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../../common/bulk-actions';
import { applyColumnFilters } from '../../common/apply-column-filters';
import { GUIDE_COLUMN_FILTERS } from './page-contents-column-filters';
import { toEntityId } from '../../common/entity-id';

export interface PageContentCreateInput {
  pageKey: string;
  sectionKey: string;
  content: Record<string, unknown>;
  isVisible?: boolean;
}

export interface PageContentUpdateInput {
  pageKey?: string;
  sectionKey?: string;
  content?: Record<string, unknown>;
  isVisible?: boolean;
}

@Injectable()
export abstract class BasePageContentsService {
  protected abstract getEm(): EntityManager;
  protected abstract getPageContentEntity(): new () => Record<string, unknown>;

  async getByKey(pageKey: string) {
    const PageContent = this.getPageContentEntity();
    return this.getEm().find(
      PageContent,
      { pageKey },
      {
        orderBy: { createdAt: 'ASC' },
      },
    );
  }

  async getByPageAndSection(pageKey: string, sectionKey: string) {
    const PageContent = this.getPageContentEntity();
    return this.getEm().findOne(PageContent, { pageKey, sectionKey });
  }

  async getById(id: string) {
    const PageContent = this.getPageContentEntity();
    return this.getEm().findOne(PageContent, { id: toEntityId(id) });
  }

  async list(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      filters?: Record<string, string>;
    } = {},
  ) {
    const PageContent = this.getPageContentEntity();
    const { page = 1, limit = 10, search, filters } = params;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search?.trim()) {
      const s = `%${search.trim()}%`;
      where.$or = [
        { pageKey: { $like: s } },
        { sectionKey: { $like: s } },
        { content: { $like: s } },
      ];
    }
    applyColumnFilters(where, filters, GUIDE_COLUMN_FILTERS);
    const whereQuery = where as FilterQuery<object>;

    const [data, total] = await Promise.all([
      this.getEm().find(PageContent, whereQuery, {
        offset,
        limit,
        orderBy: { updatedAt: 'DESC' },
      }),
      this.getEm().count(PageContent, whereQuery),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: PageContentCreateInput) {
    const PageContent = this.getPageContentEntity();
    const entity = new PageContent();
    Object.assign(entity, data);
    await this.getEm().persistAndFlush(entity);
    return entity;
  }

  async update(id: string, data: PageContentUpdateInput) {
    const PageContent = this.getPageContentEntity();
    const existing = await this.getEm().findOne(PageContent, {
      id: toEntityId(id),
    });
    if (!existing) {
      return null;
    }

    Object.assign(existing, data);
    await this.getEm().persistAndFlush(existing);
    return existing;
  }

  async delete(id: string) {
    const PageContent = this.getPageContentEntity();
    const existing = await this.getEm().findOne(PageContent, {
      id: toEntityId(id),
    });
    if (!existing) {
      return null;
    }

    await this.getEm().removeAndFlush(existing);
    return existing;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    const PageContent = this.getPageContentEntity();
    return applyBulkAction(this.getEm(), PageContent, action, ids, {
      label: 'trang',
    });
  }
}
