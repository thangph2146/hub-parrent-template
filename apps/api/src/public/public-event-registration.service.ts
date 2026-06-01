import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from '../entities/event-registration.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';

export interface RegisterForEventResult {
  id: string;
  eventId: string;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
}

@Injectable()
export class PublicEventRegistrationService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

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
      throw new Error('Không tìm thấy sự kiện hoặc sự kiện đã ngừng mở đăng ký.');
    }

    const user = await this.em.findOne(User, {
      id: uid,
      deletedAt: null,
      isActive: true,
    });
    if (!user?.email) {
      throw new Error('Tài khoản không hợp lệ. Vui lòng đăng nhập lại.');
    }

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

    const email = user.email.trim().toLowerCase();
    const existing = await this.em.findOne(EventRegistration, {
      event: event.id,
      email,
      deletedAt: null,
    });
    if (existing) {
      throw new Error('Bạn đã đăng ký sự kiện này rồi.');
    }

    const fullName = (user.name ?? user.email).trim();
    const row = await this.eventRegistrationsService.create({
      eventId: event.id,
      email,
      fullName,
      phone: phone?.trim() || user.phone || null,
      registeredAt: now,
      status: RegistrationStatus.CONFIRMED,
    });

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
