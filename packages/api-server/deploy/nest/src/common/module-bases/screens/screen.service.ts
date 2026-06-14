/**
 * Screens Service.
 *
 * Bám sát pattern của `apps/main/api/src/screens/screens.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `screen.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Screen row DTO trả về cho client.
 * Các field khớp với entity `Screen`.
 */
export interface ScreensRowDto extends CrudRowDto {
  name?: string;
  code?: unknown;
  cameraId?: number | null;
  cameraName?: string | null;
  templateId?: number | null;
  templateName?: string | null;
  status: number;
}

/**
 * Screen create DTO - tất cả optional ngoại trừ các field required.
 */
export interface ScreensCreateData extends CrudCreateData {
  name?: string;
  code?: unknown;
  status?: number;
}

/**
 * Screen update DTO - tất cả optional (Partial pattern).
 */
export interface ScreensUpdateData extends CrudUpdateData {
  name?: string;
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
    return ['name', 'code'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getBulkLabel(): string {
    return 'màn hình';
  }
}
