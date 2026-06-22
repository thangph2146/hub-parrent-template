/**
 * ParentStudents Service — domain logic (materialize → apps/main/api module-bases).
 */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { applyColumnFilters } from '../../common/apply-column-filters';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
  relationEntityId,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
} from '../../common';
import { PARENT_STUDENT_COLUMN_FILTERS } from './parent-student-column-filters';

export interface ParentStudentsRowDto {
  id: number;
  parentId: number;
  parentEmail: string | null;
  parentName: string | null;
  parentPhone: string | null;
  studentCode: string;
  studentName: string | null;
  note: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListParentStudentsResult {
  data: ParentStudentsRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddParentStudentInput {
  parentId: number;
  studentCode: string;
  studentName?: string;
  note?: string;
}

export interface ParentStudentsRealtimePort {
  pendingApproval(payload: {
    resource: string;
    id: number;
    status: string;
    title: string;
    description?: string | null;
    actionUrl?: string | null;
    actorUserId?: string;
  }): void;
  parentStudentReviewed(payload: {
    id: number;
    parentId: number;
    studentCode: string;
    studentName: string | null;
    status: 'approved' | 'rejected';
    reviewedAt: string;
    reviewedBy: string;
  }): void;
}

function mapRow(r: Record<string, unknown>): ParentStudentsRowDto {
  const parent = r.parent;
  const parentObj =
    parent != null && typeof parent === 'object'
      ? (parent as Record<string, unknown>)
      : null;
  return {
    id: r.id as number,
    parentId: relationEntityId(r.parent) ?? relationEntityId(parentObj) ?? 0,
    parentEmail:
      typeof parentObj?.email === 'string' ? parentObj.email : null,
    parentName:
      parentObj?.name == null
        ? null
        : typeof parentObj.name === 'string'
          ? parentObj.name
          : null,
    parentPhone:
      typeof parentObj?.phone === 'string' ? parentObj.phone : null,
    studentCode: String(r.studentCode ?? ''),
    studentName: (r.studentName as string | null | undefined) ?? null,
    note: (r.note as string | null | undefined) ?? null,
    status: String(r.status ?? ''),
    reviewedBy: (r.reviewedBy as string | null | undefined) ?? null,
    reviewedAt: safeIsoString(r.reviewedAt as Date | string | null | undefined),
    createdAt: safeIsoStringNow(r.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(r.updatedAt as Date | string | null | undefined),
  };
}

@Injectable()
export abstract class BaseParentStudentsService {
  protected readonly logger = new Logger(BaseParentStudentsService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getStudentEntity(): new () => Record<string, unknown>;
  protected abstract getAdminRealtime(): ParentStudentsRealtimePort;

  protected async resolveStudentForRequest(
    em: EntityManager,
    studentCode: string,
    studentName: string | null,
  ): Promise<Record<string, unknown>> {
    const Student = this.getStudentEntity();
    const where = {
      studentCode,
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>;
    const existing = await em.findOne(Student, where);
    if (existing) {
      return existing as Record<string, unknown>;
    }

    const created = em.create(Student, {
      studentCode,
      name: studentName,
      isActive: true,
    }) as Record<string, unknown>;
    await em.persistAndFlush(created);
    return created;
  }

  async listByParent(parentId: string): Promise<ParentStudentsRowDto[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const rows = await em.find(
      Entity,
      { parent: toEntityId(parentId) },
      {
        populate: ['parent'] as never,
        orderBy: { createdAt: 'DESC' },
      },
    );
    return rows.map((row) => mapRow(row as Record<string, unknown>));
  }

  async listPending(params: {
    page: number;
    limit: number;
  }): Promise<ListParentStudentsResult> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = { status: 'pending' } as FilterQuery<Record<string, unknown>>;
    const [rows, total] = await Promise.all([
      em.find(Entity, where, {
        populate: ['parent'] as never,
        orderBy: { createdAt: 'ASC' },
        offset: skip,
        limit,
      }),
      em.count(Entity, where),
    ]);
    return {
      data: rows.map((row) => mapRow(row as Record<string, unknown>)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async listAll(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    createdAt?: string;
    filters?: Record<string, string>;
  }): Promise<ListParentStudentsResult> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: Record<string, unknown> = {};
    if (
      params.status &&
      ['pending', 'approved', 'rejected'].includes(params.status)
    ) {
      where.status = params.status;
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      where.$or = [
        { studentCode: { $re: `(?i)${escaped}` } },
        { studentName: { $re: `(?i)${escaped}` } },
        { parentId: { $re: `(?i)${escaped}` } },
      ];
    }
    if (params.createdAt?.trim()) {
      const [fromStr, toStr] = params.createdAt.split(',');
      const dateRange: Record<string, Date> = {};
      if (fromStr?.trim()) {
        const fromDate = new Date(fromStr.trim());
        if (!Number.isNaN(fromDate.getTime())) {
          dateRange.$gte = fromDate;
        }
      }
      if (toStr?.trim()) {
        const toDate = new Date(toStr.trim());
        toDate.setHours(23, 59, 59, 999);
        if (!Number.isNaN(toDate.getTime())) {
          dateRange.$lte = toDate;
        }
      }
      if (Object.keys(dateRange).length > 0) {
        where.createdAt = dateRange;
      }
    }
    applyColumnFilters(where, params.filters, PARENT_STUDENT_COLUMN_FILTERS);
    const whereQuery = where as FilterQuery<Record<string, unknown>>;
    const [rows, total] = await Promise.all([
      em.find(Entity, whereQuery, {
        populate: ['parent'] as never,
        orderBy: { createdAt: 'DESC' },
        offset: skip,
        limit,
      }),
      em.count(Entity, whereQuery),
    ]);
    return {
      data: rows.map((row) => mapRow(row as Record<string, unknown>)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  /** Alias cho template controller pkg (list admin chuẩn). */
  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    filters?: Record<string, string>;
  }): Promise<ListParentStudentsResult> {
    return this.listAll({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.filters?.status ?? params.status,
      createdAt: params.filters?.createdAt,
      filters: params.filters,
    });
  }

  async addStudentRequest(
    data: AddParentStudentInput,
  ): Promise<ParentStudentsRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const User = this.getUserEntity();
    const trimmedCode = data.studentCode.trim();
    if (!trimmedCode) {
      throw new BadRequestException('Mã sinh viên không được để trống');
    }

    const student = await this.resolveStudentForRequest(
      em,
      trimmedCode,
      data.studentName?.trim() ?? null,
    );
    const studentId = student.id as number;

    const existing = await em.findOne(Entity, {
      parent: toEntityId(String(data.parentId)),
      studentCode: trimmedCode,
    });
    if (existing) {
      throw new BadRequestException(
        'Bạn đã gửi yêu cầu liên kết với mã sinh viên này rồi.',
      );
    }

    const ps = new Entity() as Record<string, unknown>;
    ps.parent = em.getReference(User, data.parentId);
    ps.student = em.getReference(this.getStudentEntity(), studentId);
    ps.studentCode = trimmedCode;
    ps.studentName =
      data.studentName?.trim() ??
      (typeof student.name === 'string' ? student.name : null);
    ps.note = data.note?.trim() ?? null;
    ps.status = 'pending';
    await em.persistAndFlush(ps);
    const row = mapRow(ps);
    this.getAdminRealtime().pendingApproval({
      resource: 'parent-students',
      id: row.id,
      status: 'pending',
      title: 'Yêu cầu liên kết phụ huynh mới',
      description: `${row.studentCode}${row.studentName ? ` — ${row.studentName}` : ''}`,
      actionUrl: '/admin/parent-students',
      actorUserId: String(data.parentId),
    });
    return row;
  }

  async review(
    id: string,
    action: 'approved' | 'rejected',
    reviewedBy: string,
  ): Promise<ParentStudentsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const ps = await em.findOne(Entity, { id: toEntityId(id) });
    if (!ps) return null;
    const row = ps as Record<string, unknown>;
    row.status = action;
    row.reviewedBy = reviewedBy;
    row.reviewedAt = new Date();
    await em.persistAndFlush(ps);
    const mapped = mapRow(row);
    this.getAdminRealtime().parentStudentReviewed({
      id: mapped.id,
      parentId: mapped.parentId,
      studentCode: mapped.studentCode,
      studentName: mapped.studentName,
      status: action,
      reviewedAt: mapped.reviewedAt ?? new Date().toISOString(),
      reviewedBy,
    });
    return mapped;
  }

  async remove(id: string, parentId: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const ps = await em.findOne(Entity, {
      id: toEntityId(id),
      parent: toEntityId(parentId),
    });
    if (!ps) return false;
    await em.removeAndFlush(ps);
    return true;
  }

  async removeForParent(
    id: string | number,
    parentId: string | number,
  ): Promise<boolean> {
    return this.remove(String(id), String(parentId));
  }

  async removeByAdmin(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const ps = await em.findOne(Entity, { id: toEntityId(id) });
    if (!ps) return false;
    await em.removeAndFlush(ps);
    return true;
  }

  async getById(id: string): Promise<ParentStudentsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const ps = await em.findOne(
      Entity,
      { id: toEntityId(id) },
      { populate: ['parent'] as never },
    );
    return ps ? mapRow(ps as Record<string, unknown>) : null;
  }
}
