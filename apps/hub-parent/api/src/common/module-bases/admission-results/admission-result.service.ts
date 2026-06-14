/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * AdmissionResults Service — domain logic (materialize → apps/main/api module-bases).
 */
import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
  toEntityIdList,
} from '../../index';

export interface AdmissionResultsRowDto {
  id: number;
  cccd: string | null;
  soBaoDanh: string | null;
  hoTen: string;
  nganhDangKy: string;
  diemMon1: string | null;
  diemMon2: string | null;
  diemMon3: string | null;
  diemTong: string | null;
  diemUuTienKhuVuc: string | null;
  diemUuTienDoiTuong: string | null;
  ghiChu: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ListAdmissionResultsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
}

export interface ListAdmissionResultsResult {
  data: AdmissionResultsRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdmissionResultsCreateData {
  cccd?: string | null;
  soBaoDanh?: string | null;
  hoTen: string;
  nganhDangKy: string;
  diemMon1?: string | null;
  diemMon2?: string | null;
  diemMon3?: string | null;
  diemTong?: string | null;
  diemUuTienKhuVuc?: string | null;
  diemUuTienDoiTuong?: string | null;
  ghiChu?: string | null;
}

export type AdmissionResultsUpdateData = Partial<AdmissionResultsCreateData>;

function mapRow(r: Record<string, unknown>): AdmissionResultsRowDto {
  return {
    id: r.id as number,
    cccd: (r.cccd as string | null | undefined) ?? null,
    soBaoDanh: (r.soBaoDanh as string | null | undefined) ?? null,
    hoTen: String(r.hoTen ?? ''),
    nganhDangKy: String(r.nganhDangKy ?? ''),
    diemMon1: (r.diemMon1 as string | null | undefined) ?? null,
    diemMon2: (r.diemMon2 as string | null | undefined) ?? null,
    diemMon3: (r.diemMon3 as string | null | undefined) ?? null,
    diemTong: (r.diemTong as string | null | undefined) ?? null,
    diemUuTienKhuVuc: (r.diemUuTienKhuVuc as string | null | undefined) ?? null,
    diemUuTienDoiTuong: (r.diemUuTienDoiTuong as string | null | undefined) ?? null,
    ghiChu: (r.ghiChu as string | null | undefined) ?? null,
    createdAt: safeIsoStringNow(r.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(r.updatedAt as Date | string | null | undefined),
    deletedAt: safeIsoString(r.deletedAt as Date | string | null | undefined),
  };
}

function buildWhere(
  params: ListAdmissionResultsParams,
): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const status = params.status ?? 'active';
  if (status === 'deleted') where.deletedAt = { $ne: null };
  else if (status === 'active') where.deletedAt = null;
  if (params.search?.trim()) {
    const q = params.search.trim();
    where.$or = [
      { hoTen: { $like: `%${q}%` } },
      { nganhDangKy: { $like: `%${q}%` } },
      { cccd: { $like: `%${q}%` } },
      { soBaoDanh: { $like: `%${q}%` } },
    ];
  }
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const v = value.trim();
      if (key === 'hoTen') where.hoTen = { $like: `%${v}%` };
      else if (key === 'nganhDangKy') where.nganhDangKy = { $like: `%${v}%` };
      else if (key === 'cccd') where.cccd = { $like: `%${v}%` };
      else if (key === 'soBaoDanh') where.soBaoDanh = { $like: `%${v}%` };
    }
  }
  return where;
}

@Injectable()
export abstract class BaseAdmissionResultsService {
  protected readonly logger = new Logger(BaseAdmissionResultsService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;

  async list(
    params: ListAdmissionResultsParams,
  ): Promise<ListAdmissionResultsResult> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildWhere(params) as FilterQuery<Record<string, unknown>>;
    const [rows, total] = await Promise.all([
      em.find(Entity, where, {
        orderBy: { updatedAt: 'DESC' },
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

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const where: Record<string, unknown> = { deletedAt: null };
    if (search?.trim()) {
      const q = search.trim();
      if (column === 'hoTen') where.hoTen = { $like: `%${q}%` };
      else if (column === 'nganhDangKy') where.nganhDangKy = { $like: `%${q}%` };
      else if (column === 'soBaoDanh') where.soBaoDanh = { $like: `%${q}%` };
      else where.hoTen = { $like: `%${q}%` };
    }
    const rows = await em.find(Entity, where as FilterQuery<Record<string, unknown>>, {
      fields: [column] as never,
      orderBy: { [column]: 'ASC' } as never,
      limit,
    });
    const seen = new Set<string>();
    return rows
      .map((r) => String((r as Record<string, unknown>)[column] ?? ''))
      .filter((v) => v && !seen.has(v) && (seen.add(v), true))
      .map((value) => ({ label: value, value }));
  }

  async getById(id: string): Promise<AdmissionResultsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    return r ? mapRow(r as Record<string, unknown>) : null;
  }

  async lookup(
    cccd: string,
    soBaoDanh: string,
  ): Promise<AdmissionResultsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const c = cccd.trim();
    const s = soBaoDanh.trim();
    if (!c || !s) return null;

    const exact = await em.findOne(Entity, {
      cccd: c,
      soBaoDanh: s,
      deletedAt: null,
    });
    if (exact) return mapRow(exact as Record<string, unknown>);

    const bySoBaoDanh = await em.findOne(Entity, {
      soBaoDanh: s,
      deletedAt: null,
    });
    if (
      bySoBaoDanh &&
      (!(bySoBaoDanh as Record<string, unknown>).cccd ||
        (bySoBaoDanh as Record<string, unknown>).cccd === c)
    ) {
      return mapRow(bySoBaoDanh as Record<string, unknown>);
    }

    const byCccd = await em.findOne(Entity, {
      cccd: c,
      deletedAt: null,
    });
    if (
      byCccd &&
      (!(byCccd as Record<string, unknown>).soBaoDanh ||
        (byCccd as Record<string, unknown>).soBaoDanh === s)
    ) {
      return mapRow(byCccd as Record<string, unknown>);
    }

    return null;
  }

  async create(data: AdmissionResultsCreateData): Promise<AdmissionResultsRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const entity = new Entity() as Record<string, unknown>;
    entity.cccd = data.cccd?.trim() ?? null;
    entity.soBaoDanh = data.soBaoDanh?.trim() ?? null;
    entity.hoTen = data.hoTen.trim();
    entity.nganhDangKy = data.nganhDangKy.trim();
    entity.diemMon1 = data.diemMon1?.trim() ?? null;
    entity.diemMon2 = data.diemMon2?.trim() ?? null;
    entity.diemMon3 = data.diemMon3?.trim() ?? null;
    entity.diemTong = data.diemTong?.trim() ?? null;
    entity.diemUuTienKhuVuc = data.diemUuTienKhuVuc?.trim() ?? null;
    entity.diemUuTienDoiTuong = data.diemUuTienDoiTuong?.trim() ?? null;
    entity.ghiChu = data.ghiChu?.trim() ?? null;
    em.persist(entity);
    await em.flush();
    return mapRow(entity);
  }

  async update(
    id: string,
    data: AdmissionResultsUpdateData,
  ): Promise<AdmissionResultsRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const existing = await em.findOne(Entity, { id: toEntityId(id) });
    if (!existing) return null;
    const row = existing as Record<string, unknown>;
    if (data.cccd !== undefined) row.cccd = data.cccd?.trim() ?? null;
    if (data.soBaoDanh !== undefined) row.soBaoDanh = data.soBaoDanh?.trim() ?? null;
    if (data.hoTen != null) row.hoTen = data.hoTen.trim();
    if (data.nganhDangKy != null) row.nganhDangKy = data.nganhDangKy.trim();
    if (data.diemMon1 !== undefined) row.diemMon1 = data.diemMon1?.trim() ?? null;
    if (data.diemMon2 !== undefined) row.diemMon2 = data.diemMon2?.trim() ?? null;
    if (data.diemMon3 !== undefined) row.diemMon3 = data.diemMon3?.trim() ?? null;
    if (data.diemTong !== undefined) row.diemTong = data.diemTong?.trim() ?? null;
    if (data.diemUuTienKhuVuc !== undefined) {
      row.diemUuTienKhuVuc = data.diemUuTienKhuVuc?.trim() ?? null;
    }
    if (data.diemUuTienDoiTuong !== undefined) {
      row.diemUuTienDoiTuong = data.diemUuTienDoiTuong?.trim() ?? null;
    }
    if (data.ghiChu !== undefined) row.ghiChu = data.ghiChu?.trim() ?? null;
    em.persist(existing);
    await em.flush();
    return mapRow(row);
  }

  async softDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r || (r as Record<string, unknown>).deletedAt) return false;
    (r as Record<string, unknown>).deletedAt = new Date();
    em.persist(r);
    await em.flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r || !(r as Record<string, unknown>).deletedAt) return false;
    (r as Record<string, unknown>).deletedAt = null;
    em.persist(r);
    await em.flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const r = await em.findOne(Entity, { id: toEntityId(id) });
    if (!r) return false;
    em.remove(r);
    await em.flush();
    return true;
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete',
    ids: string[],
  ): Promise<{ affected: number; message: string }> {
    const em = this.getEm();
    const Entity = this.getEntity();
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };
    if (action === 'delete') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} kết quả`,
      };
    }
    if (action === 'restore') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} kết quả`,
      };
    }
    if (action === 'hard-delete') {
      const result = await em.nativeDelete(Entity, {
        id: { $in: toEntityIdList(ids) },
      });
      return {
        affected: result ?? 0,
        message: `Đã xóa vĩnh viễn ${result ?? 0} kết quả`,
      };
    }
    return { affected: 0, message: 'Action không hợp lệ' };
  }
}
