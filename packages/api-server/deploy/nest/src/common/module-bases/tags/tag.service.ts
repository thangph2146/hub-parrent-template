/**
 * Tags Service.
 *
 * Bám sát pattern của `apps/main/api/src/tags/tags.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `tag.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Tag row DTO trả về cho client.
 * Các field khớp với entity `Tag`.
 */
export interface TagsRowDto extends CrudRowDto {
  id: number | string;
  icon?: unknown;
  deletedAt?: Date | string | null;
}

/**
 * Tag create DTO - tất cả optional ngoại trừ các field required.
 */
export interface TagsCreateData extends CrudCreateData {
  icon?: unknown;
}

/**
 * Tag update DTO - tất cả optional (Partial pattern).
 */
export interface TagsUpdateData extends CrudUpdateData {
  icon?: unknown;
}

/**
 * Abstract Tags Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseTagsService extends BaseCrudService<
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData
> {
  protected readonly logger = new Logger(BaseTagsService.name);

  /** Trả về class constructor của entity (vd: `Tag`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Tag';
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
