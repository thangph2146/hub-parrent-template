/**
 * EventCheckins Service.
 *
 * Bám sát pattern của `apps/main/api/src/event-checkins/event-checkins.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface EventCheckinsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EventCheckinsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface EventCheckinsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseEventCheckinsService extends BaseCrudService<
  EventCheckinsRowDto,
  EventCheckinsCreateData,
  EventCheckinsUpdateData
> {
  protected readonly logger = new Logger(BaseEventCheckinsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'EventCheckins';
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
