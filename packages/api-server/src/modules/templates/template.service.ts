/**
 * Templates Service.
 *
 * Bám sát pattern của `apps/main/api/src/templates/templates.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `template.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Template row DTO trả về cho client.
 * Các field khớp với entity `Template`.
 */
export interface TemplatesRowDto extends CrudRowDto {
  id: number | string;
  code?: unknown;
  content?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Template create DTO - tất cả optional ngoại trừ các field required.
 */
export interface TemplatesCreateData extends CrudCreateData {
  code?: unknown;
  content?: unknown;
  status?: number;
}

/**
 * Template update DTO - tất cả optional (Partial pattern).
 */
export interface TemplatesUpdateData extends CrudUpdateData {
  code?: unknown;
  content?: unknown;
  status?: number;
}

/**
 * Abstract Templates Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseTemplatesService extends BaseCrudService<
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData
> {
  protected readonly logger = new Logger(BaseTemplatesService.name);

  /** Trả về class constructor của entity (vd: `Template`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Template';
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
