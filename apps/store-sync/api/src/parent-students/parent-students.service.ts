import {
  toEntityId,
  toEntityIdList,
  relationEntityId,
} from '../common/entity-id';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ParentStudent } from '../entities/parent-student.entity';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
} from '../common/pagination';
import { AdminRealtimeBroadcastService } from '../common/admin-realtime-broadcast.service';
import { applyColumnFilters } from '../common/apply-column-filters';
import { PARENT_STUDENT_COLUMN_FILTERS } from '../common/admin-filter-configs';

export interface ParentStudentRowDto {
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

function toIso(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function mapRow(r: ParentStudent): ParentStudentRowDto {
  const parent = r.parent as unknown;
  const parentObj =
    parent != null && typeof parent === 'object'
      ? (parent as {
          id?: unknown;
          email?: unknown;
          name?: unknown;
          phone?: unknown;
        })
      : null;
  return {
    id: r.id,
    parentId: relationEntityId(r.parent) ?? relationEntityId(parentObj) ?? 0,
    parentEmail: typeof parentObj?.email === 'string' ? parentObj.email : null,
    parentName:
      parentObj?.name == null
        ? null
        : typeof parentObj.name === 'string'
          ? parentObj.name
          : null,
    parentPhone: typeof parentObj?.phone === 'string' ? parentObj.phone : null,
    studentCode: r.studentCode,
    studentName: r.studentName ?? null,
    note: r.note ?? null,
    status: r.status,
    reviewedBy: r.reviewedBy ?? null,
    reviewedAt: toIso(r.reviewedAt),
    createdAt: toIso(r.createdAt) ?? '',
    updatedAt: toIso(r.updatedAt) ?? '',
  };
}

@Injectable()
export class ParentStudentsService {
  constructor(
    private readonly em: EntityManager,
    private readonly adminRealtime: AdminRealtimeBroadcastService,
  ) {}

  async listByParent(parentId: string): Promise<ParentStudentRowDto[]> {
    const rows = await this.em.find(
      ParentStudent,
      { parent: toEntityId(parentId) },
      {
        populate: ['parent'],
        orderBy: { createdAt: 'DESC' },
      },
    );
    return rows.map(mapRow);
  }

  async listPending(params: { page: number; limit: number }): Promise<{
    data: ParentStudentRowDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const [rows, total] = await Promise.all([
      this.em.find(
        ParentStudent,
        { status: 'pending' },
        {
          populate: ['parent'],
          orderBy: { createdAt: 'ASC' },
          offset: skip,
          limit,
        },
      ),
      this.em.count(ParentStudent, { status: 'pending' }),
    ]);
    return {
      data: rows.map(mapRow),
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
  }): Promise<{
    data: ParentStudentRowDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
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
        if (!isNaN(fromDate.getTime())) {
          dateRange.$gte = fromDate;
        }
      }
      if (toStr?.trim()) {
        const toDate = new Date(toStr.trim());
        toDate.setHours(23, 59, 59, 999);
        if (!isNaN(toDate.getTime())) {
          dateRange.$lte = toDate;
        }
      }
      if (Object.keys(dateRange).length > 0) {
        where.createdAt = dateRange;
      }
    }
    applyColumnFilters(where, params.filters, PARENT_STUDENT_COLUMN_FILTERS);
    const [rows, total] = await Promise.all([
      this.em.find(ParentStudent, where, {
        populate: ['parent'],
        orderBy: { createdAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.em.count(ParentStudent, where),
    ]);
    return {
      data: rows.map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async addStudentRequest(data: {
    parentId: number;
    studentCode: string;
    studentName?: string;
    note?: string;
  }): Promise<ParentStudentRowDto> {
    const existing = await this.em.findOne(ParentStudent, {
      parent: toEntityId(String(data.parentId)),
      studentCode: data.studentCode.trim(),
    });
    if (existing) {
      throw new Error('Bạn đã gửi yêu cầu liên kết với mã sinh viên này rồi.');
    }

    const ps = new ParentStudent();
    ps.parent = this.em.getReference(User, data.parentId) as any;
    ps.studentCode = data.studentCode.trim();
    ps.studentName = data.studentName?.trim() ?? null;
    ps.note = data.note?.trim() ?? null;
    ps.status = 'pending';
    await this.em.persistAndFlush(ps);
    const row = mapRow(ps);
    this.adminRealtime.pendingApproval({
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
  ): Promise<ParentStudentRowDto | null> {
    const ps = await this.em.findOne(ParentStudent, { id: toEntityId(id) });
    if (!ps) return null;
    ps.status = action;
    ps.reviewedBy = reviewedBy;
    ps.reviewedAt = new Date();
    await this.em.persistAndFlush(ps);
    const row = mapRow(ps);
    this.adminRealtime.parentStudentReviewed({
      id: row.id,
      parentId: row.parentId,
      studentCode: row.studentCode,
      studentName: row.studentName,
      status: action,
      reviewedAt: row.reviewedAt ?? new Date().toISOString(),
      reviewedBy,
    });
    return row;
  }

  async remove(id: string, parentId: string): Promise<boolean> {
    const ps = await this.em.findOne(ParentStudent, {
      id: toEntityId(id),
      parent: toEntityId(parentId),
    });
    if (!ps) return false;
    await this.em.removeAndFlush(ps);
    return true;
  }

  /** Xóa vĩnh viễn yêu cầu liên kết (admin, không ràng buộc phụ huynh sở hữu). */
  async removeByAdmin(id: string): Promise<boolean> {
    const ps = await this.em.findOne(ParentStudent, { id: toEntityId(id) });
    if (!ps) return false;
    await this.em.removeAndFlush(ps);
    return true;
  }

  async getById(id: string): Promise<ParentStudentRowDto | null> {
    const ps = await this.em.findOne(
      ParentStudent,
      { id: toEntityId(id) },
      { populate: ['parent'] },
    );
    return ps ? mapRow(ps) : null;
  }
}
