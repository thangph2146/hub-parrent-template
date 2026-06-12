/**
 * Accounts Service.
 *
 * Bám sát pattern của `apps/main/api/src/accounts/accounts.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `account.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Account row DTO trả về cho client.
 * Các field khớp với entity `Account`.
 */
export interface AccountsRowDto extends CrudRowDto {
  id: number | string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

/**
 * Account create DTO - tất cả optional ngoại trừ các field required.
 */
export interface AccountsCreateData extends CrudCreateData {
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

/**
 * Account update DTO - tất cả optional (Partial pattern).
 */
export interface AccountsUpdateData extends CrudUpdateData {
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

/**
 * Abstract Accounts Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseAccountsService extends BaseCrudService<
  AccountsRowDto,
  AccountsCreateData,
  AccountsUpdateData
> {
  protected readonly logger = new Logger(BaseAccountsService.name);

  /** Trả về class constructor của entity (vd: `Account`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Account';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /** Fields cho phép search LIKE. Override trong subclass nếu cần. */
  protected getSearchFields(): string[] {
    return [];
  }

  /** Fields cho phép exact-match filter. */
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }
}
