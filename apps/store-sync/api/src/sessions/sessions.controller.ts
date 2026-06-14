/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { NotificationsService } from '../notifications/notifications.service';
import { SocketGateway } from '../socket/socket.gateway';
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseSessionsController } from '../common/module-bases/sessions/sessions.controller';
import { SessionsService } from './sessions.service';

@Permissions(PERMISSIONS.SESSIONS_VIEW)
@Controller(ADMIN_ROUTES.SESSIONS)
export class SessionsController extends BaseSessionsController {
  constructor(
    service: SessionsService,
    notificationsService: NotificationsService,
    socketGateway: SocketGateway,
  ) {
    super(service, notificationsService, socketGateway);
  }
}
