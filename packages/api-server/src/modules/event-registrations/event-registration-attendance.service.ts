/** Event registration attendance — check-in/out; app binding entity, socket emit, getById. */
import {
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { relationEntityId, toEntityId } from '../../common/entity-id';
import type { EventRegistrationAttendanceDeps } from './event-registration-attendance.deps';
import type {
  ApplyAttendanceResult,
  AttendanceRegistrationRow,
  AttendanceSource,
  EventAttendancePolicy,
  EventAttendanceSocketPayload,
  ManualAttendanceAction,
} from './event-registration-attendance.types';
import {
  ATTENDANCE_STATUS,
  CHECKIN_METHOD,
  REGISTRATION_STATUS,
} from './event-registration-attendance.types';
import type { EventRegistrationRowDto } from './event-registrations.service';

export class BaseEventRegistrationAttendanceService {
  private readonly logger = new Logger(BaseEventRegistrationAttendanceService.name);

  constructor(
    protected readonly em: EntityManager,
    protected readonly deps: EventRegistrationAttendanceDeps,
  ) {}

  async applyManual(
    registrationId: string,
    action: ManualAttendanceAction,
  ): Promise<EventRegistrationRowDto> {
    const reg = await this.em.findOne(
      this.deps.eventRegistrationEntity,
      {
        id: toEntityId(registrationId),
        deletedAt: null,
      } as FilterQuery<Record<string, unknown>>,
    );
    if (!reg) {
      throw new NotFoundException('Không tìm thấy đăng ký sự kiện');
    }

    const row = reg as unknown as AttendanceRegistrationRow;
    const eventId = relationEntityId(row.event);
    if (eventId == null) {
      throw new BadRequestException('Đăng ký không gắn sự kiện hợp lệ');
    }

    const at = new Date();

    switch (action) {
      case 'checkin': {
        await this.recordCheckin({
          eventId,
          registration: row,
          at,
          source: 'manual',
          skipWindowCheck: true,
        });
        break;
      }
      case 'checkout': {
        await this.recordCheckout({
          eventId,
          registration: row,
          at,
          source: 'manual',
          skipWindowCheck: true,
        });
        break;
      }
      case 'reset-checkin':
        row.hasCheckin = false;
        row.checkinMethod = CHECKIN_METHOD.NONE;
        if (row.hasCheckout) {
          row.hasCheckout = false;
        }
        row.attendanceStatus = ATTENDANCE_STATUS.NOT_ATTENDED;
        row.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(row, eventId, 'checkin', 'manual', { duplicate: false });
        break;
      case 'reset-checkout':
        row.hasCheckout = false;
        row.attendanceStatus = row.hasCheckin
          ? ATTENDANCE_STATUS.PARTIAL
          : ATTENDANCE_STATUS.NOT_ATTENDED;
        row.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(row, eventId, 'checkout', 'manual', {
          duplicate: false,
        });
        break;
      case 'reset-all':
        row.hasCheckin = false;
        row.hasCheckout = false;
        row.checkinMethod = CHECKIN_METHOD.NONE;
        row.attendanceStatus = ATTENDANCE_STATUS.NOT_ATTENDED;
        row.updatedAt = at;
        await this.em.flush();
        await this.syncEventCounts(eventId);
        this.emitState(row, eventId, 'checkin', 'manual', { duplicate: false });
        break;
      default:
        throw new BadRequestException('Thao tác attendance không hợp lệ');
    }

    const mapped = await this.deps.getRegistrationById(registrationId);
    if (!mapped) {
      throw new NotFoundException('Không tìm thấy đăng ký sự kiện');
    }
    return mapped;
  }

  async recordCheckin(input: {
    eventId: number;
    registration: AttendanceRegistrationRow;
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
      source === 'manual' ? CHECKIN_METHOD.MANUAL : CHECKIN_METHOD.FACE_ID;
    reg.updatedAt = at;
    if (reg.status === REGISTRATION_STATUS.PENDING) {
      reg.status = REGISTRATION_STATUS.CONFIRMED;
    }
    if (reg.attendanceStatus === ATTENDANCE_STATUS.NOT_ATTENDED) {
      reg.attendanceStatus = ATTENDANCE_STATUS.PARTIAL;
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
    registration: AttendanceRegistrationRow;
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
      if (reg.attendanceStatus === ATTENDANCE_STATUS.NOT_ATTENDED) {
        reg.attendanceStatus = ATTENDANCE_STATUS.PARTIAL;
      }
    }

    reg.hasCheckout = true;
    reg.faceVerified = source === 'hanet' ? true : reg.faceVerified;
    reg.attendanceStatus = ATTENDANCE_STATUS.FULL;
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

  private async loadEvent(eventId: number): Promise<EventAttendancePolicy> {
    const event = await this.em.findOne(this.deps.eventEntity, {
      id: eventId,
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);
    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }
    return event as unknown as EventAttendancePolicy;
  }

  private assertEventAllows(
    event: EventAttendancePolicy,
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
    const checkinCount = await this.em.count(this.deps.eventRegistrationEntity, {
      event: eventId,
      hasCheckin: true,
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);
    const checkoutCount = await this.em.count(this.deps.eventRegistrationEntity, {
      event: eventId,
      hasCheckout: true,
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);
    await this.em.nativeUpdate(
      this.deps.eventEntity,
      { id: eventId },
      { totalCheckins: checkinCount, totalCheckouts: checkoutCount },
    );
  }

  private async toResult(
    eventId: number,
    reg: AttendanceRegistrationRow,
    kind: 'checkin' | 'checkout',
    duplicate: boolean,
  ): Promise<ApplyAttendanceResult> {
    const mapped = await this.deps.getRegistrationById(String(reg.id));
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
    reg: AttendanceRegistrationRow,
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
    this.deps.emitAttendance(payload);
  }
}
