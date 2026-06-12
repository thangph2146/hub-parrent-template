/**
 * CustomerCarts Service.
 *
 * Bám sát pattern của `apps/main/api/src/customer-carts/customer-carts.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface CustomerCartsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerCartsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface CustomerCartsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseCustomerCartsService extends BaseCrudService<
  CustomerCartsRowDto,
  CustomerCartsCreateData,
  CustomerCartsUpdateData
> {
  protected readonly logger = new Logger(BaseCustomerCartsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'CustomerCarts';
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
