/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { EventRegistrationsModule } from '../event-registrations/event-registrations.module';
import { SocketModule } from '../socket/socket.module';
import { HanetApiClient } from './hanet-api.client';
import { HanetSyncService } from './hanet-sync.service';
import { HanetWebhookController } from './hanet-webhook.controller';
import { HanetAdminController } from './hanet-admin.controller';
import { HanetWebhookService } from './hanet-webhook.service';
import { HanetAdminService } from './hanet-admin.service';
import { HanetRealtimeService } from './hanet-realtime.service';
import { HanetPartnerService } from './hanet-partner.service';
import { HanetPersonRegisterService } from './hanet-person-register.service';
import { HanetPersonAvatarSyncService } from './hanet-person-avatar-sync.service';
import { HanetCheckinLiveBufferService } from './hanet-checkin-live-buffer.service';
import { HanetWebhookIngestService } from './hanet-webhook-ingest.service';

@Module({
  imports: [EventRegistrationsModule, SocketModule],
  controllers: [HanetWebhookController, HanetAdminController],
  providers: [
    HanetWebhookService,
    HanetSyncService,
    HanetApiClient,
    HanetAdminService,
    HanetRealtimeService,
    HanetPartnerService,
    HanetPersonRegisterService,
    HanetPersonAvatarSyncService,
    HanetCheckinLiveBufferService,
    HanetWebhookIngestService,
  ],
  exports: [
    HanetWebhookService,
    HanetApiClient,
    HanetAdminService,
    HanetPersonRegisterService,
    HanetPersonAvatarSyncService,
    HanetCheckinLiveBufferService,
    HanetWebhookIngestService,
  ],
})
export class HanetModule {}
