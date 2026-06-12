/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseHanetWebhookService } from '@workspace/api-server/modules/hanet';
import { EventRegistrationAttendanceService } from '../event-registrations/event-registration-attendance.service';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { Camera } from '../entities/camera.entity';

export type { HanetWebhookBody, HanetCameraRole, HanetResolveContext, HanetWebhookResult } from '@workspace/api-server/modules/hanet';

@Injectable()
export class HanetWebhookService extends BaseHanetWebhookService {
  constructor(
    private readonly em: EntityManager,
    private readonly attendanceService: EventRegistrationAttendanceService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }

  protected async recordCheckin(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
    deviceId?: string | null;
    deviceName?: string | null;
  }) {
    const result = await this.attendanceService.recordCheckin({
      eventId: input.eventId,
      registration: input.registration as unknown as EventRegistration,
      at: input.at,
      source: input.source,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
    });
    return {
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      at: result.at,
      duplicate: result.duplicate,
    };
  }

  protected async recordCheckout(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
  }) {
    const result = await this.attendanceService.recordCheckout({
      eventId: input.eventId,
      registration: input.registration as unknown as EventRegistration,
      at: input.at,
      source: input.source,
    });
    return {
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      at: result.at,
      duplicate: result.duplicate,
    };
  }
}
