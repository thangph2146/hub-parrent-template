/**
 * PostTags Service.
 *
 * Bám sát pattern của `apps/main/api/src/post-tags/post-tags.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface PostTagsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PostTagsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface PostTagsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BasePostTagsService extends BaseCrudService<
  PostTagsRowDto,
  PostTagsCreateData,
  PostTagsUpdateData
> {
  protected readonly logger = new Logger(BasePostTagsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'PostTags';
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
