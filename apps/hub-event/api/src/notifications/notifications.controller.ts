/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseNotificationsController as PackageNotificationsController } from '@workspace/api-server/modules/notifications';
import { NotificationsService } from './notifications.service';

export class NotificationsController extends PackageNotificationsController {
  constructor(
    @Inject(NotificationsService) notificationsService: NotificationsService,
  ) {
    super(notificationsService);
  }
}
