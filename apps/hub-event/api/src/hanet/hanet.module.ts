/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { HanetWebhookService } from './hanet-webhook.service';
import { HanetWebhookController } from './hanet-webhook.controller';
import { EventRegistrationsModule } from '../event-registrations/event-registrations.module';

@Module({
  imports: [EventRegistrationsModule],
  controllers: [HanetWebhookController],
  providers: [HanetWebhookService],
  exports: [HanetWebhookService],
})
export class HanetModule {}
