/**
 * Sessions Service.
 *
 * Bám sát pattern của `apps/main/api/src/sessions/sessions.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `session.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Session row DTO trả về cho client.
 * Các field khớp với entity `Session`.
 */
export interface SessionsRowDto extends CrudRowDto {
  id: number | string;
  userAgent?: unknown;
  ipAddress?: unknown;
  isActive: boolean;
}

/**
 * Session create DTO - tất cả optional ngoại trừ các field required.
 */
export interface SessionsCreateData extends CrudCreateData {
  userAgent?: unknown;
  ipAddress?: unknown;
}

/**
 * Session update DTO - tất cả optional (Partial pattern).
 */
export interface SessionsUpdateData extends CrudUpdateData {
  userAgent?: unknown;
  ipAddress?: unknown;
  isActive?: boolean;
}

/**
 * Abstract Sessions Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseSessionsService extends BaseCrudService<
  SessionsRowDto,
  SessionsCreateData,
  SessionsUpdateData
> {
  protected readonly logger = new Logger(BaseSessionsService.name);

  /** Trả về class constructor của entity (vd: `Session`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Session';
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
