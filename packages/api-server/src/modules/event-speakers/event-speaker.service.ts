/**
 * EventSpeakers Service.
 *
 * Bám sát pattern của `apps/main/api/src/event-speakers/event-speakers.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface EventSpeakersRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EventSpeakersCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface EventSpeakersUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseEventSpeakersService extends BaseCrudService<
  EventSpeakersRowDto,
  EventSpeakersCreateData,
  EventSpeakersUpdateData
> {
  protected readonly logger = new Logger(BaseEventSpeakersService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'EventSpeakers';
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
