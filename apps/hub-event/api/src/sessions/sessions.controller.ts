/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseSessionsController as PackageSessionsController } from '@workspace/api-server/modules/sessions';
import { NotificationsService } from '../notifications/notifications.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SessionsService } from './sessions.service';

export class SessionsController extends PackageSessionsController {
  constructor(
    @Inject(SessionsService) sessionsService: SessionsService,
    @Inject(NotificationsService) notificationsService: NotificationsService,
    @Inject(SocketGateway) socketGateway: SocketGateway,
  ) {
    super(sessionsService, notificationsService, socketGateway);
  }
}
