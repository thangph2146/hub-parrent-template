import { toEntityId, toEntityIdList, relationEntityId } from '../common/entity-id';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Event } from '../entities/event.entity';
import {
  AttendanceStatus,
  CheckinMethod,
  EventRegistration,
  RegistrationStatus,
} from '../entities/event-registration.entity';
import { SocketGateway } from '../socket/socket.gateway';
import type { EventAttendanceSocketPayload } from '../socket/socket.types';
import type { EventRegistrationRowDto } from './event-registrations.service';
import { EventRegistrationsService } from './event-registrations.service';

export type AttendanceSource = 'hanet' | 'manual';

export type ManualAttendanceAction =
  | 'checkin'
  | 'checkout'
  | 'reset-checkin'
  | 'reset-checkout'
  | 'reset-all';

export type ApplyAttendanceResult = {
  kind: 'checkin' | 'checkout';
  eventId: number;
  email: string;
  fullName: string;
  registrationId: number;
  at: string;
  duplicate?: boolean;
  registration: EventRegistrationRowDto;
};

@Injectable()
export class EventRegistrationAttendanceService {
  private readonly logger = new Logger(EventRegistrationAttendanceService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly socketGateway: SocketGateway,
    private readonly eventRegistrationsService: EventRegistrationsService,
  ) {}

  async applyManual(
    registrationId: string,
    action: ManualAttendanceAction,
  ): Promise<EventRegistrationRowDto> {
    const reg = await this.em.findOne(EventRegistration, { id: toEntityId(registrationId),
      deletedAt: null,
    });
    if (!reg) {
      throw new NotFoundException('Không tìm thấy đăng ký sự kiện');
    }

    const eventId = relationEntityId(reg.event);
    if (eventId == null) {
      throw new BadRequestException('Đăng ký không gắn sự kiện hợp lệ');
    }

    const at = new Date();

    switch (action) {
      case 'checkin': {
        await this.recordCheckin({
          eventId,
          registration: reg,
          at,
          source: 'manual',
          skipWindowCheck: true,
        });
        break;
      }
      case 'checkout': {
        await this.recordCheckout({
          eventId,
          registration: reg,
          at,
          source: 'manual',
          skipWindowCheck: true,
        });
        break;
      }
      case 'reset-checkin':
        reg.hasCheckin = false;
        reg.checkinMethod = CheckinMethod.NONE;
        if (reg.hasCheckout) {
          reg.hasCheckout = false;
        }
        reg.attendanceStatus = AttendanceStatus.NOT_ATTENDED;
        reg.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(reg, eventId, 'checkin', 'manual', { duplicate: false });
        break;
      case 'reset-checkout':
        reg.hasCheckout = false;
        reg.attendanceStatus = reg.hasCheckin
          ? AttendanceStatus.PARTIAL
          : AttendanceStatus.NOT_ATTENDED;
        reg.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(reg, eventId, 'checkout', 'manual', {
          duplicate: false,
        });
        break;
      case 'reset-all':
        reg.hasCheckin = false;
        reg.hasCheckout = false;
        reg.checkinMethod = CheckinMethod.NONE;
        reg.attendanceStatus = AttendanceStatus.NOT_ATTENDED;
        reg.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(reg, eventId, 'checkin', 'manual', { duplicate: false });
        break;
      default:
        throw new BadRequestException('Thao tác attendance không hợp lệ');
    }

    const row = await this.eventRegistrationsService.getById(registrationId);
    if (!row) {
      throw new NotFoundException('Không tìm thấy đăng ký sự kiện');
    }
    return row;
  }

  async recordCheckin(input: {
    eventId: number;
    registration: EventRegistration;
    at: Date;
    source: AttendanceSource;
    deviceId?: string | null;
    deviceName?: string | null;
    skipWindowCheck?: boolean;
  }): Promise<ApplyAttendanceResult> {
    const { eventId, registration: reg, at, source } = input;
    if (!input.skipWindowCheck) {
      const event = await this.loadEvent(eventId);
      this.assertEventAllows(event, 'checkin', at);
    }

    if (reg.hasCheckin) {
      this.logger.debug(
        `Attendance check-in bỏ qua (đã check-in) event=${eventId} email=${reg.email}`,
      );
      const result = await this.toResult(eventId, reg, 'checkin', true);
      this.emitState(reg, eventId, 'checkin', source, {
        duplicate: true,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
      });
      return result;
    }

    reg.hasCheckin = true;
    reg.faceVerified = source === 'hanet' ? true : reg.faceVerified;
    reg.checkinMethod =
      source === 'manual' ? CheckinMethod.MANUAL : CheckinMethod.FACE_ID;
    reg.updatedAt = at;
    if (reg.status === RegistrationStatus.PENDING) {
      reg.status = RegistrationStatus.CONFIRMED;
    }
    if (reg.attendanceStatus === AttendanceStatus.NOT_ATTENDED) {
      reg.attendanceStatus = AttendanceStatus.PARTIAL;
    }
    await this.em.flush();
    await this.syncEventCounts(eventId);

    const result = await this.toResult(eventId, reg, 'checkin', false);
    this.emitState(reg, eventId, 'checkin', source, {
      duplicate: false,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    });
    this.logger.log(
      `Attendance check-in (${source}) event=${eventId} email=${reg.email}`,
    );
    return result;
  }

  async recordCheckout(input: {
    eventId: number;
    registration: EventRegistration;
    at: Date;
    source: AttendanceSource;
    skipWindowCheck?: boolean;
  }): Promise<ApplyAttendanceResult> {
    const { eventId, registration: reg, at, source } = input;
    if (!input.skipWindowCheck) {
      const event = await this.loadEvent(eventId);
      this.assertEventAllows(event, 'checkout', at);
    }

    if (reg.hasCheckout) {
      this.logger.debug(
        `Attendance check-out bỏ qua (đã check-out) event=${eventId} email=${reg.email}`,
      );
      const result = await this.toResult(eventId, reg, 'checkout', true);
      this.emitState(reg, eventId, 'checkout', source, { duplicate: true });
      return result;
    }

    if (!reg.hasCheckin) {
      reg.hasCheckin = true;
      if (reg.attendanceStatus === AttendanceStatus.NOT_ATTENDED) {
        reg.attendanceStatus = AttendanceStatus.PARTIAL;
      }
    }

    reg.hasCheckout = true;
    reg.faceVerified = source === 'hanet' ? true : reg.faceVerified;
    reg.attendanceStatus = AttendanceStatus.FULL;
    reg.updatedAt = at;
    await this.em.flush();
    await this.syncEventCounts(eventId);

    const result = await this.toResult(eventId, reg, 'checkout', false);
    this.emitState(reg, eventId, 'checkout', source, { duplicate: false });
    this.logger.log(
      `Attendance check-out (${source}) event=${eventId} email=${reg.email}`,
    );
    return result;
  }

  private async loadEvent(eventId: number): Promise<Event> {
    const event = await this.em.findOne(Event, { id: eventId,
      deletedAt: null,
    });
    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }
    return event;
  }

  private assertEventAllows(
    event: Event,
    kind: 'checkin' | 'checkout',
    at: Date,
  ): void {
    if (kind === 'checkin' && !event.allowCheckin) {
      throw new BadRequestException('Sự kiện không cho phép check-in');
    }
    if (kind === 'checkout' && !event.allowCheckout) {
      throw new BadRequestException('Sự kiện không cho phép check-out');
    }

    const within = (start?: Date | null, end?: Date | null) => {
      if (start && at < start) return false;
      if (end && at > end) return false;
      return true;
    };

    if (kind === 'checkin') {
      if (
        (event.checkinStart || event.checkinEnd) &&
        !within(event.checkinStart, event.checkinEnd)
      ) {
        throw new BadRequestException(
          'Thời điểm check-in nằm ngoài khung giờ cho phép',
        );
      }
      return;
    }

    const windowStart = event.checkoutStart ?? event.checkinEnd ?? null;
    const windowEnd = event.checkoutEnd ?? event.endDate ?? null;
    if ((windowStart || windowEnd) && !within(windowStart, windowEnd)) {
      throw new BadRequestException(
        'Thời điểm check-out nằm ngoài khung giờ cho phép',
      );
    }
  }

  private async syncEventCounts(eventId: number): Promise<void> {
    const checkinCount = await this.em.count(EventRegistration, {
      event: eventId,
      hasCheckin: true,
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
    const checkoutCount = await this.em.count(EventRegistration, {
      event: eventId,
      hasCheckout: true,
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
    await this.em.nativeUpdate(
      Event,
      { id: eventId },{ totalCheckins: checkinCount, totalCheckouts: checkoutCount },
    );
  }

  private async toResult(eventId: number,
    reg: EventRegistration,
    kind: 'checkin' | 'checkout',
    duplicate: boolean,
  ): Promise<ApplyAttendanceResult> {
    const mapped = await this.eventRegistrationsService.getById(String(reg.id));
    if (!mapped) {
      throw new NotFoundException('Không tìm thấy đăng ký sự kiện');
    }
    return {
      kind,
      eventId,
      email: reg.email,
      fullName: reg.fullName,
      registrationId: reg.id,
      at: reg.updatedAt.toISOString(),
      duplicate,
      registration: mapped,
    };
  }

  private emitState(
    reg: EventRegistration,
    eventId: number,
    kind: 'checkin' | 'checkout',
    source: AttendanceSource,
    extra: {
      duplicate?: boolean;
      deviceId?: string | null;
      deviceName?: string | null;
    },
  ): void {
    const payload: EventAttendanceSocketPayload = {
      kind,
      eventId,
      at: reg.updatedAt.toISOString(),
      email: reg.email,
      fullName: reg.fullName,
      source,
      deviceId: extra.deviceId ?? null,
      deviceName: extra.deviceName ?? null,
      registrationId: reg.id,
      checkinId: null,
      duplicate: extra.duplicate,
      hasCheckin: reg.hasCheckin,
      hasCheckout: reg.hasCheckout,
    };
    this.socketGateway.emitEventAttendance(payload);
  }
}
