/**
 * AdmissionResults Service.
 *
 * Bám sát pattern của `apps/main/api/src/admission-results/admission-results.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface AdmissionResultsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdmissionResultsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface AdmissionResultsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseAdmissionResultsService extends BaseCrudService<
  AdmissionResultsRowDto,
  AdmissionResultsCreateData,
  AdmissionResultsUpdateData
> {
  protected readonly logger = new Logger(BaseAdmissionResultsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'AdmissionResults';
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
