/**
 * UserRoles Service.
 *
 * Bám sát pattern của `apps/main/api/src/user-roles/user-roles.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface UserRolesRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UserRolesCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface UserRolesUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseUserRolesService extends BaseCrudService<
  UserRolesRowDto,
  UserRolesCreateData,
  UserRolesUpdateData
> {
  protected readonly logger = new Logger(BaseUserRolesService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'UserRoles';
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
