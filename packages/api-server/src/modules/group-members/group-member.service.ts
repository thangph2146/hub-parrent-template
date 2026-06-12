/**
 * GroupMembers Service.
 *
 * Bám sát pattern của `apps/main/api/src/group-members/group-members.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface GroupMembersRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupMembersCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface GroupMembersUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseGroupMembersService extends BaseCrudService<
  GroupMembersRowDto,
  GroupMembersCreateData,
  GroupMembersUpdateData
> {
  protected readonly logger = new Logger(BaseGroupMembersService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'GroupMembers';
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
