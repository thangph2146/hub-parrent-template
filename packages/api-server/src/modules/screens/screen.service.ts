/**
 * Screens Service.
 *
 * Bám sát pattern của `apps/main/api/src/screens/screens.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `screen.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Screen row DTO trả về cho client.
 * Các field khớp với entity `Screen`.
 */
export interface ScreensRowDto extends CrudRowDto {
  id: number | string;
  code?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Screen create DTO - tất cả optional ngoại trừ các field required.
 */
export interface ScreensCreateData extends CrudCreateData {
  code?: unknown;
  status?: number;
}

/**
 * Screen update DTO - tất cả optional (Partial pattern).
 */
export interface ScreensUpdateData extends CrudUpdateData {
  code?: unknown;
  status?: number;
}

/**
 * Abstract Screens Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseScreensService extends BaseCrudService<
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData
> {
  protected readonly logger = new Logger(BaseScreensService.name);

  /** Trả về class constructor của entity (vd: `Screen`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Screen';
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
