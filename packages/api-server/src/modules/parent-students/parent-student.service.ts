/**
 * ParentStudents Service.
 *
 * Bám sát pattern của `apps/main/api/src/parent-students/parent-students.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData, ListCrudParams } from '../../types';

export interface ParentStudentsRowDto extends CrudRowDto {
  id: number | string;
  parentId?: number | string | null;
  parentEmail?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  studentCode?: string;
  studentName?: string | null;
  note?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentStudentsCreateData extends CrudCreateData {
  parentId?: number | string;
  studentCode?: string;
  studentName?: string | null;
  note?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ParentStudentsUpdateData extends CrudUpdateData {
  studentCode?: string;
  studentName?: string | null;
  note?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface AddParentStudentInput {
  parentId: number;
  studentCode: string;
  studentName?: string | null;
  note?: string | null;
}

@Injectable()
export abstract class BaseParentStudentsService extends BaseCrudService<
  ParentStudentsRowDto,
  ParentStudentsCreateData,
  ParentStudentsUpdateData
> {
  protected readonly logger = new Logger(BaseParentStudentsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  private toIsoOrEmpty(value: unknown): string {
    const date = new Date(String(value ?? ''));
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
  protected getEntityName(): string {
    return 'ParentStudents';
  }
  protected getSearchFields(): string[] {
    return ['studentCode', 'studentName'];
  }
  protected getFilterableFields(): string[] {
    return ['status', 'parentId'];
  }
  protected getSoftDeleteField(): string | null {
    return null;
  }

  protected mapRow(entity: Record<string, unknown>): ParentStudentsRowDto {
    const parent =
      entity.parent && typeof entity.parent === 'object'
        ? (entity.parent as Record<string, unknown>)
        : null;
    return {
      ...(entity as CrudRowDto),
      id: entity.id as number | string,
      parentId: (entity.parentId as number | string | null | undefined) ?? (parent?.id as number | string | null | undefined) ?? null,
      parentEmail:
        typeof parent?.email === 'string' ? parent.email : null,
      parentName:
        typeof parent?.name === 'string' ? parent.name : null,
      parentPhone:
        typeof parent?.phone === 'string' ? parent.phone : null,
      studentCode:
        typeof entity.studentCode === 'string' ? entity.studentCode : undefined,
      studentName:
        typeof entity.studentName === 'string' ? entity.studentName : null,
      note: typeof entity.note === 'string' ? entity.note : null,
      status:
        entity.status === 'approved' || entity.status === 'rejected' || entity.status === 'pending'
          ? entity.status
          : undefined,
      reviewedBy:
        typeof entity.reviewedBy === 'string' ? entity.reviewedBy : null,
      reviewedAt:
        entity.reviewedAt == null ? null : new Date(String(entity.reviewedAt)).toISOString(),
      createdAt: this.toIsoOrEmpty(entity.createdAt),
      updatedAt: this.toIsoOrEmpty(entity.updatedAt),
    };
  }

  protected buildWhere(params: ListCrudParams): Record<string, unknown> {
    const where = super.buildWhere({ ...params, status: 'all' });
    const flatStatus =
      params.filters?.status ?? (params as unknown as { status?: unknown }).status;
    if (
      typeof flatStatus === 'string' &&
      ['pending', 'approved', 'rejected'].includes(flatStatus)
    ) {
      where.status = flatStatus;
    }

    const createdAt = params.filters?.createdAt;
    if (typeof createdAt === 'string' && createdAt.trim()) {
      const [fromStr, toStr] = createdAt.split(',');
      const range: Record<string, Date> = {};
      if (fromStr?.trim()) {
        const from = new Date(fromStr.trim());
        if (!Number.isNaN(from.getTime())) range.$gte = from;
      }
      if (toStr?.trim()) {
        const to = new Date(toStr.trim());
        to.setHours(23, 59, 59, 999);
        if (!Number.isNaN(to.getTime())) range.$lte = to;
      }
      if (Object.keys(range).length > 0) {
        where.createdAt = range;
      }
    }

    return where;
  }

  async review(
    id: string | number,
    action: 'approved' | 'rejected',
    reviewerId: string,
  ): Promise<ParentStudentsRowDto | null> {
    return this.update(id, {
      status: action,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
    });
  }

  async listByParent(parentId: string | number): Promise<ParentStudentsRowDto[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const entityId = this.toEntityId(parentId);
    const options = {
      populate: ['parent'],
      orderBy: { createdAt: 'DESC' as const },
    } as never;

    let rows = await em.find(
      Entity,
      { parent: entityId } as Record<string, unknown>,
      options,
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      rows = await em.find(
        Entity,
        { parentId: entityId } as Record<string, unknown>,
        options,
      );
    }
    return rows.map((row) => this.mapRow(row as Record<string, unknown>));
  }

  async addStudentRequest(data: AddParentStudentInput): Promise<ParentStudentsRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const parentId = this.toEntityId(data.parentId);
    const studentCode = data.studentCode.trim();
    const duplicate =
      (await em.findOne(Entity, {
        parent: parentId,
        studentCode,
      } as Record<string, unknown>)) ??
      (await em.findOne(Entity, {
        parentId,
        studentCode,
      } as Record<string, unknown>));
    if (duplicate) {
      throw new Error('Bạn đã gửi yêu cầu liên kết với mã sinh viên này rồi.');
    }

    const entity = new Entity() as Record<string, unknown>;
    entity.parent = em.getReference('User' as never, parentId);
    entity.parentId = parentId;
    entity.studentCode = studentCode;
    entity.studentName = data.studentName?.trim() ?? null;
    entity.note = data.note?.trim() ?? null;
    entity.status = 'pending';
    em.persist(entity);
    await em.flush();
    return this.mapRow(entity);
  }

  async removeForParent(
    id: string | number,
    parentId: string | number,
  ): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const entityId = this.toEntityId(id);
    const ownerId = this.toEntityId(parentId);
    const found =
      (await em.findOne(Entity, {
        id: entityId,
        parent: ownerId,
      } as Record<string, unknown>)) ??
      (await em.findOne(Entity, {
        id: entityId,
        parentId: ownerId,
      } as Record<string, unknown>));
    if (!found) return false;
    await em.removeAndFlush(found);
    return true;
  }
}
