import { Injectable } from '@nestjs/common';
import type { EntityManager } from '@mikro-orm/core';
import { toEntityId } from '../../common';
import { normalizePosterField } from '../../common/poster-normalize';
import type { IPublicEventRegistrationAdminDeps } from './public-event-registration.deps';

const REGISTRATION_STATUS_CONFIRMED = 1;
const REGISTRATION_STATUS_CANCELLED = 2;

export interface RegisterForEventResult {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
}

export interface MyRegisteredEventItem {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  phone: string | null;
  registeredAt: string | null;
  status: number;
  hasCheckin: boolean;
  hasCheckout: boolean;
  attendanceStatus: number;
  attendanceMinutes: number;
  checkinMethod: number;
  event: {
    id: number;
    title: string;
    slug: string | null;
    poster: unknown;
    startDate: string | null;
    endDate: string | null;
    registrationStart: string | null;
    registrationEnd: string | null;
    location: string | null;
    address: string | null;
    format: number;
    status: number;
  };
}

function toIso(
  value: Date | string | number | undefined | null,
): string | null {
  if (value == null) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === 'number')
    return Number.isNaN(value) ? null : new Date(value).toISOString();
  if (typeof value === 'string' && value.trim()) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }
  return null;
}

@Injectable()
export abstract class BasePublicEventRegistrationService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationsService(): IPublicEventRegistrationAdminDeps;

  private async getActiveUser(userId: string): Promise<{
    user: Record<string, unknown>;
    email: string;
  }> {
    const em = this.getEm();
    const User = this.getUserEntity();
    const uid = userId?.trim();
    if (!uid) {
      throw new Error('Vui lòng đăng nhập trước khi tiếp tục.');
    }

    const user = await em.findOne(User, {
      id: toEntityId(uid),
      deletedAt: null,
      isActive: true,
    } as never);
    const row = user as Record<string, unknown> | null;
    if (!row?.email) {
      throw new Error('Tài khoản không hợp lệ. Vui lòng đăng nhập lại.');
    }
    return { user: row, email: String(row.email).trim().toLowerCase() };
  }

  private mapMyRegistration(row: Record<string, unknown>): MyRegisteredEventItem {
    const event = (row.event as Record<string, unknown> | undefined) ?? {};
    return {
      id: row.id as number,
      eventId: (row.eventId as number) ?? (event.id as number),
      email: String(row.email ?? ''),
      fullName: String(row.fullName ?? ''),
      phone: (row.phone as string | null | undefined) ?? null,
      registeredAt: toIso(row.registeredAt as never),
      status: Number(row.status ?? 0) || 0,
      hasCheckin: Boolean(row.hasCheckin),
      hasCheckout: Boolean(row.hasCheckout),
      attendanceStatus: Number(row.attendanceStatus ?? 0) || 0,
      attendanceMinutes: Number(row.attendanceMinutes ?? 0) || 0,
      checkinMethod: Number(row.checkinMethod ?? 0) || 0,
      event: {
        id: event.id as number,
        title: String(event.title ?? ''),
        slug: (event.slug as string | null | undefined) ?? null,
        poster: normalizePosterField(event.poster),
        startDate: toIso(event.startDate as never),
        endDate: toIso(event.endDate as never),
        registrationStart: toIso(event.registrationStart as never),
        registrationEnd: toIso(event.registrationEnd as never),
        location: (event.location as string | null | undefined) ?? null,
        address: (event.address as string | null | undefined) ?? null,
        format: Number(event.format ?? 0) || 0,
        status: Number(event.status ?? 0) || 0,
      },
    };
  }

  async listMyEvents(userId: string): Promise<MyRegisteredEventItem[]> {
    const em = this.getEm();
    const EventRegistration = this.getEventRegistrationEntity();
    const { email } = await this.getActiveUser(userId);

    const rows = await em.find(
      EventRegistration,
      {
        email,
        deletedAt: null,
      } as never,
      {
        populate: ['event'],
        orderBy: { registeredAt: 'DESC', createdAt: 'DESC' },
      },
    );

    return rows.map((row) => this.mapMyRegistration(row as Record<string, unknown>));
  }

  private assertCanCancelRegistration(
    row: Record<string, unknown>,
    event: Record<string, unknown>,
  ): void {
    if (Number(row.status) === REGISTRATION_STATUS_CANCELLED) {
      return;
    }
    if (row.hasCheckin) {
      throw new Error('Không thể hủy đăng ký sau khi đã check-in.');
    }

    const now = new Date();
    const registrationStart = event.registrationStart as Date | null | undefined;
    const registrationEnd = event.registrationEnd as Date | null | undefined;
    const startDate = event.startDate as Date | null | undefined;

    if (registrationStart && now < registrationStart) {
      throw new Error('Chưa đến thời gian đăng ký, không thể hủy.');
    }
    if (registrationEnd && now > registrationEnd) {
      throw new Error('Đã hết thời hạn đăng ký, không thể hủy.');
    }
    if (!registrationStart && !registrationEnd) {
      if (startDate && now >= startDate) {
        throw new Error('Sự kiện đã bắt đầu, không thể hủy đăng ký.');
      }
      return;
    }
    if (startDate && now >= startDate) {
      throw new Error('Sự kiện đã bắt đầu, không thể hủy đăng ký.');
    }
  }

  async cancelMyRegistration(
    userId: string,
    registrationId: string,
  ): Promise<MyRegisteredEventItem> {
    const em = this.getEm();
    const EventRegistration = this.getEventRegistrationEntity();
    const { email } = await this.getActiveUser(userId);
    const id = registrationId?.trim();
    if (!id) throw new Error('Thiếu mã đăng ký.');

    const row = await em.findOne(
      EventRegistration,
      { id: toEntityId(id), email, deletedAt: null } as never,
      { populate: ['event'] },
    );
    if (!row) throw new Error('Không tìm thấy đăng ký sự kiện.');

    const record = row as Record<string, unknown>;
    const event = record.event as Record<string, unknown>;
    if (Number(record.status) === REGISTRATION_STATUS_CANCELLED) {
      return this.mapMyRegistration(record);
    }

    this.assertCanCancelRegistration(record, event);

    record.status = REGISTRATION_STATUS_CANCELLED;
    await em.flush();
    await this.getEventRegistrationsService().syncEventRegistrationCount(
      event.id as string | number,
    );
    return this.mapMyRegistration(record);
  }

  async register(
    eventSlug: string,
    userId: string,
    phone?: string | null,
  ): Promise<RegisterForEventResult> {
    const em = this.getEm();
    const Event = this.getEventEntity();
    const EventRegistration = this.getEventRegistrationEntity();
    const slug = eventSlug?.trim();
    const uid = userId?.trim();
    if (!slug || !uid) {
      throw new Error('Thiếu thông tin sự kiện hoặc người dùng.');
    }

    const eventRow = await em.findOne(Event, {
      slug,
      deletedAt: null,
      status: 1,
    } as never);
    if (!eventRow) {
      throw new Error(
        'Không tìm thấy sự kiện hoặc sự kiện đã ngừng mở đăng ký.',
      );
    }
    const event = eventRow as Record<string, unknown>;

    const { user, email } = await this.getActiveUser(uid);

    const now = new Date();
    if (event.registrationStart && now < new Date(event.registrationStart as never)) {
      throw new Error('Chưa đến thời gian mở đăng ký cho sự kiện này.');
    }
    if (event.registrationEnd && now > new Date(event.registrationEnd as never)) {
      throw new Error('Đã hết hạn đăng ký tham gia sự kiện này.');
    }
    if (event.endDate && now > new Date(event.endDate as never)) {
      throw new Error('Sự kiện đã kết thúc, không thể đăng ký.');
    }

    const maxParticipants = Number(event.maxParticipants ?? 0) || 0;
    if (maxParticipants > 0) {
      const count = await em.count(EventRegistration, {
        event: event.id,
        deletedAt: null,
        status: { $ne: REGISTRATION_STATUS_CANCELLED },
      } as never);
      if (count >= maxParticipants) {
        throw new Error('Sự kiện đã đủ số lượng đăng ký.');
      }
    }

    const existing = await em.findOne(EventRegistration, {
      event: event.id,
      email,
      deletedAt: null,
    } as never);
    const existingRow = existing as Record<string, unknown> | null;
    if (existingRow && Number(existingRow.status) !== REGISTRATION_STATUS_CANCELLED) {
      throw new Error('Bạn đã đăng ký sự kiện này rồi.');
    }

    const fullName = String(user.name ?? email).trim();
    const normalizedPhone =
      phone?.trim() || (user.phone as string | null | undefined) || null;
    const admin = this.getEventRegistrationsService();
    const row = existingRow
      ? await (async () => {
          existingRow.fullName = fullName;
          existingRow.phone = normalizedPhone;
          existingRow.registeredAt = now;
          existingRow.status = REGISTRATION_STATUS_CONFIRMED;
          existingRow.hasCheckin = false;
          existingRow.hasCheckout = false;
          await em.flush();
          return admin.getById(String(existingRow.id));
        })()
      : await admin.create({
          eventId: event.id as number,
          email,
          fullName,
          phone: normalizedPhone,
          registeredAt: now,
          status: REGISTRATION_STATUS_CONFIRMED,
        });
    if (!row) throw new Error('Không thể lưu đăng ký sự kiện.');

    await admin.syncEventRegistrationCount(event.id as string | number);
    event.totalRegistrations = await admin.syncEventRegistrationCount(
      event.id as string | number,
    );

    return {
      id: row.id,
      eventId: row.eventId,
      email: row.email,
      fullName: row.fullName,
      status: row.status,
      registeredAt: row.registeredAt,
    };
  }
}
