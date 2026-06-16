/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

export interface EventCheckoutRowDto {
  id: number | string;
  eventId: number | string;
  email: string;
  fullName: string;
  phone: string | null;
  checkoutTime: string | null;
  attendanceStatus: number;
  attendanceMinutes: number;
  hasCheckin: boolean;
  faceVerified: boolean;
  createdAt: string | null;
}

export interface ListEventCheckoutsParams {
  eventId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface ListEventCheckoutsResult {
  data: EventCheckoutRowDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface BulkClearCheckoutsResult {
  affected: number;
  message: string;
}

@Injectable()
export abstract class BaseEventCheckoutsService {
  protected readonly logger = new Logger(BaseEventCheckoutsService.name);

  protected abstract getEm(): EntityManager;

  async list(params: ListEventCheckoutsParams): Promise<ListEventCheckoutsResult> {
    const em = this.getEm();
    const connection = em.getConnection();
    const { eventId, page, limit, search } = params;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 1000);
    const offset = (safePage - 1) * safeLimit;

    let whereExtra = '';
    const bindings: unknown[] = [eventId];
    if (search?.trim()) {
      whereExtra = 'AND (er.email LIKE ? OR er.fullName LIKE ?)';
      const q = `%${search.trim()}%`;
      bindings.push(q, q);
    }

    const countRow = await connection.execute(
      `SELECT COUNT(*) AS cnt FROM event_registrations er WHERE er.eventId = ? AND er.hasCheckout = true AND er.deletedAt IS NULL ${whereExtra}`,
      bindings,
    );
    const total = Number((countRow as Array<Record<string, unknown>>)[0]?.cnt ?? 0);

    const rows = await connection.execute(
      `SELECT er.id, er.eventId, er.email, er.fullName, er.phone, er.updatedAt AS checkoutTime, er.attendanceStatus, er.attendanceMinutes, er.hasCheckin, er.faceVerified, er.createdAt FROM event_registrations er WHERE er.eventId = ? AND er.hasCheckout = true AND er.deletedAt IS NULL ${whereExtra} ORDER BY er.updatedAt DESC LIMIT ? OFFSET ?`,
      [...bindings, safeLimit, offset],
    );

    const data = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as number | string,
      eventId: r.eventId as number | string,
      email: String(r.email ?? ''),
      fullName: String(r.fullName ?? ''),
      phone: r.phone ? String(r.phone) : null,
      checkoutTime: r.checkoutTime ? new Date(r.checkoutTime as string).toISOString() : null,
      attendanceStatus: Number(r.attendanceStatus ?? 0),
      attendanceMinutes: Number(r.attendanceMinutes ?? 0),
      hasCheckin: r.hasCheckin === true || r.hasCheckin === 1,
      faceVerified: r.faceVerified === true || r.faceVerified === 1,
      createdAt: r.createdAt ? new Date(r.createdAt as string).toISOString() : null,
    }));

    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      data,
      pagination: { page: safePage, limit: safeLimit, total, totalPages },
    };
  }

  async bulkClear(ids: string[]): Promise<BulkClearCheckoutsResult> {
    if (!ids.length) {
      return { affected: 0, message: 'Không có bản ghi nào' };
    }
    const em = this.getEm();
    const placeholders = ids.map(() => '?').join(',');
    const result = await em.getConnection().execute(
      `UPDATE event_registrations SET hasCheckout = false, updatedAt = NOW() WHERE id IN (${placeholders}) AND hasCheckout = true AND deletedAt IS NULL`,
      ids,
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    return {
      affected,
      message: `Đã hủy checkout ${affected} lượt đăng ký`,
    };
  }
}
