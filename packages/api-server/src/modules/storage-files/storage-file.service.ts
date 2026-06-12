/**
 * StorageFiles Service.
 *
 * Bám sát pattern của `apps/main/api/src/storage-files/storage-files.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface StorageFilesRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StorageFilesCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface StorageFilesUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseStorageFilesService extends BaseCrudService<
  StorageFilesRowDto,
  StorageFilesCreateData,
  StorageFilesUpdateData
> {
  protected readonly logger = new Logger(BaseStorageFilesService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'StorageFiles';
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
