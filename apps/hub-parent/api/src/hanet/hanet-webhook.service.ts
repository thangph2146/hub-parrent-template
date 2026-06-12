import {
  toEntityId,
  toEntityIdList,
  relationEntityId,
} from '../common/entity-id';
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { EntityManager, type FilterQuery } from '@mikro-orm/core';

import { Event } from '../entities/event.entity';

import { EventRegistration } from '../entities/event-registration.entity';

import { Camera } from '../entities/camera.entity';

import { EventRegistrationAttendanceService } from '../event-registrations/event-registration-attendance.service';

import {
  HANET_PERSON_ID_KEYS,
  HANET_PERSON_NAME_KEYS,
  pickHanetDeviceId,
  pickHanetString,
  pickHanetTimestamp,
  pickHanetAttendanceKind,
} from './hanet-payload';

import type {
  HanetCameraRole,
  HanetResolveContext,
  HanetWebhookBody,
  HanetWebhookResult,
} from './hanet.types';

const EVENT_CAMERA_POPULATE = ['checkinCamera', 'checkoutCamera'] as const;

function resolveAttendanceKind(
  body: HanetWebhookBody,

  cameraRole: HanetCameraRole | null,
): HanetCameraRole {
  return pickHanetAttendanceKind(body) ?? cameraRole ?? 'checkin';
}

@Injectable()
export class HanetWebhookService {
  private readonly logger = new Logger(HanetWebhookService.name);

  constructor(
    private readonly em: EntityManager,

    private readonly attendanceService: EventRegistrationAttendanceService,
  ) {}

  async resolveContext(
    eventIdParam: string | undefined,

    body: HanetWebhookBody,
  ): Promise<HanetResolveContext> {
    const deviceId = pickHanetDeviceId(body);

    const fromParam = eventIdParam?.trim();

    if (fromParam) {
      const event = await this.em.findOne(Event, {
        id: toEntityId(fromParam),

        deletedAt: null,
      });

      if (!event) {
        throw new NotFoundException('Không tìm thấy sự kiện');
      }

      const cameraRole = deviceId
        ? await this.inferCameraRole(event.id, deviceId)
        : null;

      return { eventId: event.id, cameraRole };
    }

    if (!deviceId) {
      throw new BadRequestException(
        'Thiếu eventId trên URL hoặc deviceID trong payload HANET',
      );
    }

    const eventCheckin = await this.em.findOne(
      Event,

      {
        deletedAt: null,

        checkinCamera: { code: deviceId, deletedAt: null },
      } as FilterQuery<Event>,
    );

    if (eventCheckin) {
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${eventCheckin.id} (camera check-in)`,
      );

      return { eventId: eventCheckin.id, cameraRole: 'checkin' };
    }

    const eventCheckout = await this.em.findOne(
      Event,

      {
        deletedAt: null,

        checkoutCamera: { code: deviceId, deletedAt: null },
      } as FilterQuery<Event>,
    );

    if (eventCheckout) {
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${eventCheckout.id} (camera check-out)`,
      );

      return { eventId: eventCheckout.id, cameraRole: 'checkout' };
    }

    const camera = await this.em.findOne(
      Camera,

      { code: deviceId, deletedAt: null } as FilterQuery<Camera>,

      { populate: ['linkedEvent'] },
    );

    const linkedId = camera?.linkedEvent?.id;

    if (linkedId) {
      const event = await this.em.findOne(Event, {
        id: linkedId,

        deletedAt: null,
      });

      if (event) {
        const cameraRole = await this.inferCameraRole(event.id, deviceId);

        this.logger.debug(
          `HANET deviceID=${deviceId} → event ${linkedId} (camera "${camera.name}")`,
        );

        return { eventId: event.id, cameraRole };
      }
    }

    if (camera) {
      this.logger.warn(
        `HANET deviceID=${deviceId} khớp camera "${camera.name}" nhưng chưa gắn sự kiện`,
      );
    }

    throw new BadRequestException(
      `Thiếu eventId. Gắn sự kiện cho camera (code=${deviceId}) hoặc dùng POST /api/public/hanet/webhook/{eventId}`,
    );
  }

  private async inferCameraRole(
    eventId: number,

    deviceId: string,
  ): Promise<HanetCameraRole | null> {
    const event = await this.em.findOne(
      Event,

      { id: eventId, deletedAt: null },
      { populate: [...EVENT_CAMERA_POPULATE] },
    );

    if (!event) return null;

    const isCheckin = event.checkinCamera?.code === deviceId;

    const isCheckout = event.checkoutCamera?.code === deviceId;

    if (isCheckin && isCheckout) return null;

    if (isCheckout) return 'checkout';

    if (isCheckin) return 'checkin';

    return null;
  }

  async handleWebhook(
    eventIdParam: string | undefined,

    body: HanetWebhookBody,
  ): Promise<HanetWebhookResult> {
    const { eventId, cameraRole } = await this.resolveContext(
      eventIdParam,

      body,
    );

    const kind = resolveAttendanceKind(body, cameraRole);

    const at = pickHanetTimestamp(body);

    const fullName = pickHanetString(body, HANET_PERSON_NAME_KEYS) || 'Khách';

    const aliasId = pickHanetString(body, HANET_PERSON_ID_KEYS);

    const emailFromBody = pickHanetString(body, ['email', 'personEmail']);

    const email =
      emailFromBody ||
      (aliasId.includes('@') ? aliasId : `${aliasId || 'hanet'}@hanet.local`);

    const registration = await this.findRegistration(
      String(eventId),
      email,
      fullName,
    );

    if (!registration) {
      throw new BadRequestException(
        'Người này chưa có trong danh sách đăng ký sự kiện',
      );
    }

    if (kind === 'checkin') {
      const result = await this.attendanceService.recordCheckin({
        eventId,

        registration,

        at,

        source: 'hanet',

        deviceId: pickHanetDeviceId(body) || null,

        deviceName:
          pickHanetString(body, ['deviceName', 'device_name']) || null,
      });

      return {
        kind: 'checkin',

        eventId,

        email: result.email,

        fullName: result.fullName,

        registrationId: result.registrationId,

        checkinId: null,

        at: result.at,

        duplicate: result.duplicate,
      };
    }

    const result = await this.attendanceService.recordCheckout({
      eventId,

      registration,

      at,

      source: 'hanet',
    });

    return {
      kind: 'checkout',

      eventId,

      email: result.email,

      fullName: result.fullName,

      registrationId: result.registrationId,

      checkinId: null,

      at: result.at,

      duplicate: result.duplicate,
    };
  }

  private async findRegistration(
    eventId: string,

    email: string,

    fullName: string,
  ): Promise<EventRegistration | null> {
    const byEmail = await this.em.findOne(EventRegistration, {
      event: toEntityId(eventId),

      email,

      deletedAt: null,
    } as FilterQuery<EventRegistration>);

    if (byEmail) return byEmail;

    if (fullName) {
      return this.em.findOne(EventRegistration, {
        event: toEntityId(eventId),

        fullName,

        deletedAt: null,
      } as FilterQuery<EventRegistration>);
    }

    return null;
  }
}
