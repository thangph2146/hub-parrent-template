/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module } from '@nestjs/common';
import { EventRegistrationsModule } from '../event-registrations/event-registrations.module';
import { HanetWebhookController } from './hanet-webhook.controller';
import { HanetWebhookService } from './hanet-webhook.service';

@Module({
  imports: [EventRegistrationsModule],
  controllers: [HanetWebhookController],
  providers: [HanetWebhookService],
  exports: [HanetWebhookService],
})
export class HanetModule {}
