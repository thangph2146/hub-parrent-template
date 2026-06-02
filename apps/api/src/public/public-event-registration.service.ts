import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from '../entities/event-registration.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';
import { normalizePosterField } from '../common/poster-normalize';

export interface RegisterForEventResult {
  id: string;
  eventId: string;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
}

export interface MyRegisteredEventItem {
  id: string;
  eventId: string;
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
    id: string;
    title: string;
    slug: string | null;
    poster: unknown;
    startDate: string | null;
    endDate: string | null;
    registrationEnd: string | null;
    location: string | null;
    address: string | null;
    format: number;
    status: number;
  };
}

type ActiveEventUser = {
  user: User;
  email: string;
};

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
export class PublicEventRegistrationService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  private async getActiveUser(userId: string): Promise<ActiveEventUser> {
    const uid = userId?.trim();
    if (!uid) {
      throw new Error('Vui lòng đăng nhập trước khi tiếp tục.');
    }

    const user = await this.em.findOne(User, {
      id: uid,
      deletedAt: null,
      isActive: true,
    });
    if (!user?.email) {
      throw new Error('Tài khoản không hợp lệ. Vui lòng đăng nhập lại.');
    }
    return { user, email: user.email.trim().toLowerCase() };
  }

  private mapMyRegistration(row: EventRegistration): MyRegisteredEventItem {
    const event = row.event;
    return {
      id: row.id,
      eventId: event.id,
      email: row.email,
      fullName: row.fullName,
      phone: row.phone ?? null,
      registeredAt: toIso(row.registeredAt),
      status: row.status,
      hasCheckin: row.hasCheckin,
      hasCheckout: row.hasCheckout,
      attendanceStatus: row.attendanceStatus,
      attendanceMinutes: row.attendanceMinutes,
      checkinMethod: row.checkinMethod,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug ?? null,
        poster: normalizePosterField(event.poster),
        startDate: toIso(event.startDate),
        endDate: toIso(event.endDate),
        registrationEnd: toIso(event.registrationEnd),
        location: event.location ?? null,
        address: event.address ?? null,
        format: event.format,
        status: event.status,
      },
    };
  }

  async listMyEvents(userId: string): Promise<MyRegisteredEventItem[]> {
    const { email } = await this.getActiveUser(userId);

    const rows = await this.em.find(
      EventRegistration,
      {
        email,
        deletedAt: null,
      },
      {
        populate: ['event'],
        orderBy: { registeredAt: 'DESC', createdAt: 'DESC' },
      },
    );

    return rows.map((row) => this.mapMyRegistration(row));
  }

  private assertCanCancelRegistration(
    row: EventRegistration,
    event: Event,
  ): void {
    if (row.status === RegistrationStatus.CANCELLED) {
      return;
    }
    if (row.hasCheckin) {
      throw new Error('Không thể hủy đăng ký sau khi đã check-in.');
    }

    const now = new Date();

    if (event.registrationEnd && now > event.registrationEnd) {
      throw new Error('Đã hết thời hạn đăng ký, không thể hủy.');
    }
    if (event.startDate && now >= event.startDate) {
      throw new Error('Sự kiện đã bắt đầu, không thể hủy đăng ký.');
    }
  }

  async cancelMyRegistration(
    userId: string,
    registrationId: string,
  ): Promise<MyRegisteredEventItem> {
    const { email } = await this.getActiveUser(userId);
    const id = registrationId?.trim();
    if (!id) throw new Error('Thiếu mã đăng ký.');

    const row = await this.em.findOne(
      EventRegistration,
      {
        id,
        email,
        deletedAt: null,
      },
      { populate: ['event'] },
    );
    if (!row) throw new Error('Không tìm thấy đăng ký sự kiện.');

    const event = row.event as Event;
    if (row.status === RegistrationStatus.CANCELLED) {
      return this.mapMyRegistration(row);
    }

    this.assertCanCancelRegistration(row, event);

    row.status = RegistrationStatus.CANCELLED;
    await this.em.flush();
    await this.eventRegistrationsService.syncEventRegistrationCount(event.id);
    return this.mapMyRegistration(row);
  }

  async register(
    eventSlug: string,
    userId: string,
    phone?: string | null,
  ): Promise<RegisterForEventResult> {
    const slug = eventSlug?.trim();
    const uid = userId?.trim();
    if (!slug || !uid) {
      throw new Error('Thiếu thông tin sự kiện hoặc người dùng.');
    }

    const event = await this.em.findOne(Event, {
      slug,
      deletedAt: null,
      status: 1,
    });
    if (!event) {
      throw new Error(
        'Không tìm thấy sự kiện hoặc sự kiện đã ngừng mở đăng ký.',
      );
    }

    const { user, email } = await this.getActiveUser(uid);

    const now = new Date();
    if (event.registrationStart && now < event.registrationStart) {
      throw new Error('Chưa đến thời gian mở đăng ký cho sự kiện này.');
    }
    if (event.registrationEnd && now > event.registrationEnd) {
      throw new Error('Đã hết hạn đăng ký tham gia sự kiện này.');
    }
    if (event.endDate && now > event.endDate) {
      throw new Error('Sự kiện đã kết thúc, không thể đăng ký.');
    }

    if (event.maxParticipants > 0) {
      const count = await this.em.count(EventRegistration, {
        event: event.id,
        deletedAt: null,
        status: { $ne: RegistrationStatus.CANCELLED },
      });
      if (count >= event.maxParticipants) {
        throw new Error('Sự kiện đã đủ số lượng đăng ký.');
      }
    }

    const existing = await this.em.findOne(EventRegistration, {
      event: event.id,
      email,
      deletedAt: null,
    });
    if (existing && existing.status !== RegistrationStatus.CANCELLED) {
      throw new Error('Bạn đã đăng ký sự kiện này rồi.');
    }

    const fullName = (user.name ?? email).trim();
    const normalizedPhone = phone?.trim() || user.phone || null;
    const row = existing
      ? await (async () => {
          existing.fullName = fullName;
          existing.phone = normalizedPhone;
          existing.registeredAt = now;
          existing.status = RegistrationStatus.CONFIRMED;
          existing.hasCheckin = false;
          existing.hasCheckout = false;
          await this.em.flush();
          return this.eventRegistrationsService.getById(existing.id);
        })()
      : await this.eventRegistrationsService.create({
          eventId: event.id,
          email,
          fullName,
          phone: normalizedPhone,
          registeredAt: now,
          status: RegistrationStatus.CONFIRMED,
        });
    if (!row) throw new Error('Không thể lưu đăng ký sự kiện.');

    const totalRegistrations =
      await this.eventRegistrationsService.syncEventRegistrationCount(event.id);
    event.totalRegistrations = totalRegistrations;

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
