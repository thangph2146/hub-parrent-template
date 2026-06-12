/**
 * EventRegistrations Service.
 *
 * Bám sát pattern của `apps/main/api/src/event-registrations/event-registrations.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface EventRegistrationsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EventRegistrationsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface EventRegistrationsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseEventRegistrationsService extends BaseCrudService<
  EventRegistrationsRowDto,
  EventRegistrationsCreateData,
  EventRegistrationsUpdateData
> {
  protected readonly logger = new Logger(BaseEventRegistrationsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'EventRegistrations';
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
