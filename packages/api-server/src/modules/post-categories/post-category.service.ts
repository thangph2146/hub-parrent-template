/**
 * PostCategories Service.
 *
 * Bám sát pattern của `apps/main/api/src/post-categories/post-categories.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface PostCategoriesRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PostCategoriesCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface PostCategoriesUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BasePostCategoriesService extends BaseCrudService<
  PostCategoriesRowDto,
  PostCategoriesCreateData,
  PostCategoriesUpdateData
> {
  protected readonly logger = new Logger(BasePostCategoriesService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'PostCategories';
  }
  protected getSearchFields(): string[] {
    return [];
  }
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }
}
