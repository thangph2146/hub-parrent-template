/**
 * SeoMetas Service.
 *
 * Bám sát pattern của `apps/main/api/src/seo-metas/seo-metas.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface SeoMetasRowDto extends CrudRowDto {
  id: number | string;
  page?: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  status?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SeoMetasCreateData extends CrudCreateData {
  page?: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  status?: number | null;
  isActive?: boolean;
}

export interface SeoMetasUpdateData extends CrudUpdateData {
  page?: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  status?: number | null;
  isActive?: boolean;
}

@Injectable()
export abstract class BaseSeoMetasService extends BaseCrudService<
  SeoMetasRowDto,
  SeoMetasCreateData,
  SeoMetasUpdateData
> {
  protected readonly logger = new Logger(BaseSeoMetasService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'SeoMetas';
  }
  protected getSearchFields(): string[] {
    return ['page', 'title', 'description', 'keywords', 'ogTitle', 'ogDescription'];
  }
  protected getFilterableFields(): string[] {
    return ['status', 'isActive'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  async getByPage(page: string): Promise<SeoMetasRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const found = await em.findOne(Entity, {
      page: page.trim(),
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);
    if (!found) return null;
    return this.mapRow(found as Record<string, unknown>);
  }

  async upsertByPage(
    page: string,
    data: Omit<SeoMetasUpdateData, 'page'>,
  ): Promise<SeoMetasRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const normalizedPage = page.trim();
    const found = await em.findOne(Entity, {
      page: normalizedPage,
    } as FilterQuery<Record<string, unknown>>);

    if (found) {
      Object.assign(found as Record<string, unknown>, data, { page: normalizedPage });
      await em.flush();
      return this.mapRow(found as Record<string, unknown>);
    }

    const entity = new Entity() as Record<string, unknown>;
    Object.assign(entity, data, { page: normalizedPage });
    em.persist(entity);
    await em.flush();
    return this.mapRow(entity);
  }
}
