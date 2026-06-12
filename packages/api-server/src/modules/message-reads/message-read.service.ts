/**
 * MessageReads Service.
 *
 * Bám sát pattern của `apps/main/api/src/message-reads/message-reads.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface MessageReadsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MessageReadsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface MessageReadsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseMessageReadsService extends BaseCrudService<
  MessageReadsRowDto,
  MessageReadsCreateData,
  MessageReadsUpdateData
> {
  protected readonly logger = new Logger(BaseMessageReadsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'MessageReads';
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
