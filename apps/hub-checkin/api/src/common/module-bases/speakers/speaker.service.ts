/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Speakers Service.
 *
 * Bám sát pattern của `apps/main/api/src/speakers/speakers.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `speaker.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Speaker row DTO trả về cho client.
 * Các field khớp với entity `Speaker`.
 */
export interface SpeakersRowDto extends CrudRowDto {
  name?: string;
  title?: unknown;
  organization?: unknown;
  bio?: unknown;
  avatar?: unknown;
  email?: unknown;
  phone?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Speaker create DTO - tất cả optional ngoại trừ các field required.
 */
export interface SpeakersCreateData extends CrudCreateData {
  name?: string;
  title?: unknown;
  organization?: unknown;
  bio?: unknown;
  avatar?: unknown;
  email?: unknown;
  phone?: unknown;
  status?: number;
}

/**
 * Speaker update DTO - tất cả optional (Partial pattern).
 */
export interface SpeakersUpdateData extends CrudUpdateData {
  name?: string;
  title?: unknown;
  organization?: unknown;
  bio?: unknown;
  avatar?: unknown;
  email?: unknown;
  phone?: unknown;
  status?: number;
}

/**
 * Abstract Speakers Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseSpeakersService extends BaseCrudService<
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData
> {
  protected readonly logger = new Logger(BaseSpeakersService.name);

  /** Trả về class constructor của entity (vd: `Speaker`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Speaker';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  protected getSearchFields(): string[] {
    return ['name', 'title', 'organization', 'email', 'phone'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getBulkLabel(): string {
    return 'diễn giả';
  }
}
