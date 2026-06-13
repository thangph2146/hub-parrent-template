/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseHanetWebhookController as PackageHanetWebhookController } from '@workspace/api-server/modules/hanet';
import { HanetWebhookService } from './hanet-webhook.service';

export class HanetWebhookController extends PackageHanetWebhookController {
  constructor(
    @Inject(HanetWebhookService) hanetWebhookService: HanetWebhookService,
  ) {
    super(hanetWebhookService);
  }
}
