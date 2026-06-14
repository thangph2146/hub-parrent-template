/**
 * ImportedUsers Service.
 *
 * Bám sát pattern của `apps/main/api/src/imported-users/imported-users.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

export interface ImportedUsersRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ImportedUsersCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface ImportedUsersUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseImportedUsersService extends BaseCrudService<
  ImportedUsersRowDto,
  ImportedUsersCreateData,
  ImportedUsersUpdateData
> {
  protected readonly logger = new Logger(BaseImportedUsersService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'ImportedUsers';
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
