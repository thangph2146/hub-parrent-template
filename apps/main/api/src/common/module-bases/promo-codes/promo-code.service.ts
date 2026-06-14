/**
 * PromoCodes Service.
 *
 * Bám sát pattern của `apps/main/api/src/promo-codes/promo-codes.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

export interface PromoCodesRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PromoCodesCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface PromoCodesUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BasePromoCodesService extends BaseCrudService<
  PromoCodesRowDto,
  PromoCodesCreateData,
  PromoCodesUpdateData
> {
  protected readonly logger = new Logger(BasePromoCodesService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'PromoCodes';
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
