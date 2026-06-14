/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * HanetWebhookService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { HanetWebhookService } from './hanet-webhook.service';
import { EventRegistrationAttendanceService } from '../event-registrations/event-registration-attendance.service';

describe('HanetWebhookService', () => {
  let service: HanetWebhookService;
  let em: Partial<EntityManager>;

  beforeEach(async () => {
    em = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HanetWebhookService,
        { provide: EntityManager, useValue: em },
        {
          provide: EventRegistrationAttendanceService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HanetWebhookService>(HanetWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
