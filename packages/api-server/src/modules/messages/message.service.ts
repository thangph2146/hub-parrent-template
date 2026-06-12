/**
 * Messages Service.
 *
 * Bám sát pattern của `apps/main/api/src/messages/messages.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `message.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Message row DTO trả về cho client.
 * Các field khớp với entity `Message`.
 */
export interface MessagesRowDto extends CrudRowDto {
  id: number | string;
  isRead: boolean;
  type: unknown;
  deletedAt?: Date | string | null;
}

/**
 * Message create DTO - tất cả optional ngoại trừ các field required.
 */
export interface MessagesCreateData extends CrudCreateData {
  isRead?: boolean;
  type?: unknown;
}

/**
 * Message update DTO - tất cả optional (Partial pattern).
 */
export interface MessagesUpdateData extends CrudUpdateData {
  isRead?: boolean;
  type?: unknown;
}

/**
 * Abstract Messages Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseMessagesService extends BaseCrudService<
  MessagesRowDto,
  MessagesCreateData,
  MessagesUpdateData
> {
  protected readonly logger = new Logger(BaseMessagesService.name);

  /** Trả về class constructor của entity (vd: `Message`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Message';
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
