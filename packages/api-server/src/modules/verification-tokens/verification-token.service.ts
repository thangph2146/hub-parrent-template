/**
 * VerificationTokens Service.
 *
 * Bám sát pattern của `apps/main/api/src/verification-tokens/verification-tokens.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface VerificationTokensRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VerificationTokensCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface VerificationTokensUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseVerificationTokensService extends BaseCrudService<
  VerificationTokensRowDto,
  VerificationTokensCreateData,
  VerificationTokensUpdateData
> {
  protected readonly logger = new Logger(BaseVerificationTokensService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'VerificationTokens';
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
