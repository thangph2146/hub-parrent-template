/**
 * PageContents Service.
 *
 * Bám sát pattern của `apps/main/api/src/page-contents/page-contents.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface PageContentsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PageContentsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface PageContentsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BasePageContentsService extends BaseCrudService<
  PageContentsRowDto,
  PageContentsCreateData,
  PageContentsUpdateData
> {
  protected readonly logger = new Logger(BasePageContentsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'PageContents';
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
