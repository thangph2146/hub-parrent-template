/**
 * Categories Service.
 */
import { Injectable, Logger } from '@nestjs/common';
import type { FilterQuery } from '@mikro-orm/core';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface CategoryRowDto extends CrudRowDto {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryCreateData extends CrudCreateData {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

export interface CategoryUpdateData extends CrudUpdateData {
  name?: string;
  slug?: string;
  description?: string | null;
  parentId?: number | string | null;
  isActive?: boolean;
}

export interface CategoryUsageRow {
  slug: string;
  productCount: number;
}

@Injectable()
export abstract class BaseCategoriesService extends BaseCrudService<
  CategoryRowDto,
  CategoryCreateData,
  CategoryUpdateData
> {
  protected readonly logger = new Logger(BaseCategoriesService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'Category';
  }
  protected getSearchFields(): string[] {
    return ['name', 'slug', 'description'];
  }
  protected getFilterableFields(): string[] {
    return ['parentId', 'isActive', 'type'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  async getUsage(): Promise<CategoryUsageRow[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const rows = await em.find(Entity, {
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);

    return rows
      .map((row) => ({
        slug: String((row as Record<string, unknown>).slug ?? '').trim(),
        productCount: Number(
          (row as Record<string, unknown>).productCount ??
            ((row as Record<string, unknown>)._count as Record<string, unknown> | undefined)?.posts ??
            0,
        ),
      }))
      .filter((row) => row.slug.length > 0);
  }
}
