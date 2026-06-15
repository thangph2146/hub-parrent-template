/**
 * ContactRequests Service.
 *
 * Bám sát pattern của `apps/main/api/src/contact-requests/contact-requests.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type {
  CrudRowDto,
  CrudCreateData,
  CrudUpdateData,
  ListCrudParams,
} from '../../module-types';
import { toEntityIdList } from '../../index';

export interface ContactRequestsRowDto extends CrudRowDto {
  id: number | string;
  name?: string;
  email?: string;
  phone?: string | null;
  subject?: string;
  content?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead?: boolean;
  assignedToId?: string | number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ContactRequestsCreateData extends CrudCreateData {
  name?: string;
  email?: string;
  phone?: string | null;
  subject?: string;
  content?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead?: boolean;
  assignedToId?: string | number | null;
}

export interface ContactRequestsUpdateData extends CrudUpdateData {
  name?: string;
  email?: string;
  phone?: string | null;
  subject?: string;
  content?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead?: boolean;
  assignedToId?: string | number | null;
}

export type ContactRequestBulkAction =
  | 'delete'
  | 'restore'
  | 'hard-delete'
  | 'mark-read'
  | 'mark-unread'
  | 'update-status';

@Injectable()
export abstract class BaseContactRequestsService extends BaseCrudService<
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData
> {
  protected readonly logger = new Logger(BaseContactRequestsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'ContactRequests';
  }
  protected getSearchFields(): string[] {
    return ['name', 'email', 'phone', 'subject', 'content'];
  }
  protected getFilterableFields(): string[] {
    return ['status', 'priority', 'isRead', 'assignedToId'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  protected buildWhere(params: ListCrudParams): Record<string, unknown> {
    const where = super.buildWhere({
      ...params,
      status:
        params.status === 'deleted' || params.status === 'all'
          ? params.status
          : 'all',
    });

    if (
      params.status &&
      ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(params.status)
    ) {
      where.status = params.status;
      where.deletedAt = null;
    }

    return where;
  }

  async bulkAction(
    action: ContactRequestBulkAction,
    ids: string[],
    status?: ContactRequestsUpdateData['status'],
  ): Promise<{ affectedCount: number; message: string }> {
    if (!ids.length) {
      return { affectedCount: 0, message: 'Không có bản ghi nào' };
    }

    const em = this.getEm();
    const Entity = this.getEntity();
    const entityIds = toEntityIdList(ids);

    if (action === 'update-status' && status) {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: entityIds }, deletedAt: null } as Record<string, unknown>,
        { status },
      );
      return {
        affectedCount: result ?? 0,
        message: `Đã cập nhật trạng thái ${result ?? 0} ban ghi`,
      };
    }

    if (action === 'mark-read') {
      const result = await em.nativeUpdate(
        Entity,
        {
          id: { $in: entityIds },
          deletedAt: null,
          isRead: false,
        } as Record<string, unknown>,
        { isRead: true },
      );
      return {
        affectedCount: result ?? 0,
        message: `Đã đánh dấu đã đọc ${result ?? 0} ban ghi`,
      };
    }

    if (action === 'mark-unread') {
      const result = await em.nativeUpdate(
        Entity,
        {
          id: { $in: entityIds },
          deletedAt: null,
          isRead: true,
        } as Record<string, unknown>,
        { isRead: false },
      );
      return {
        affectedCount: result ?? 0,
        message: `Đã đánh dấu chưa đọc ${result ?? 0} ban ghi`,
      };
    }

    if (action === 'delete') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: entityIds }, deletedAt: null } as Record<string, unknown>,
        { deletedAt: new Date() },
      );
      return {
        affectedCount: result ?? 0,
        message: `Đã xóa ${result ?? 0} ban ghi`,
      };
    }

    if (action === 'restore') {
      const result = await em.nativeUpdate(
        Entity,
        {
          id: { $in: entityIds },
          deletedAt: { $ne: null },
        } as Record<string, unknown>,
        { deletedAt: null },
      );
      return {
        affectedCount: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} ban ghi`,
      };
    }

    if (action === 'hard-delete') {
      const result = await em.nativeDelete(Entity, {
        id: { $in: entityIds },
      } as Record<string, unknown>);
      return {
        affectedCount: result ?? 0,
        message: `Đã xóa vĩnh viễn ${result ?? 0} ban ghi`,
      };
    }

    return { affectedCount: 0, message: 'Action không hợp lệ' };
  }
}
