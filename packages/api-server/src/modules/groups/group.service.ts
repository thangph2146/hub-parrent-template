/**
 * Groups Service.
 *
 * Bám sát pattern của `apps/main/api/src/groups/groups.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `group.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Group row DTO trả về cho client.
 * Các field khớp với entity `Group`.
 */
export interface GroupsRowDto extends CrudRowDto {
  id: number | string;
  description?: unknown;
  avatar?: unknown;
  deletedAt?: Date | string | null;
}

/**
 * Group create DTO - tất cả optional ngoại trừ các field required.
 */
export interface GroupsCreateData extends CrudCreateData {
  description?: unknown;
  avatar?: unknown;
}

/**
 * Group update DTO - tất cả optional (Partial pattern).
 */
export interface GroupsUpdateData extends CrudUpdateData {
  description?: unknown;
  avatar?: unknown;
}

/**
 * Abstract Groups Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseGroupsService extends BaseCrudService<
  GroupsRowDto,
  GroupsCreateData,
  GroupsUpdateData
> {
  protected readonly logger = new Logger(BaseGroupsService.name);

  /** Trả về class constructor của entity (vd: `Group`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Group';
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
