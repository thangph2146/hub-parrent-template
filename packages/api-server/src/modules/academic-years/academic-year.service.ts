/**
 * AcademicYears Service.
 *
 * Bám sát pattern của `apps/main/api/src/academic-years/academic-years.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface AcademicYearsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AcademicYearsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface AcademicYearsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseAcademicYearsService extends BaseCrudService<
  AcademicYearsRowDto,
  AcademicYearsCreateData,
  AcademicYearsUpdateData
> {
  protected readonly logger = new Logger(BaseAcademicYearsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'AcademicYears';
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
