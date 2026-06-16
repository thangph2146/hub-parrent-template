/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseCommentsController } from '../common/module-bases/comments/comments.controller';
import { CommentsService } from './comments.service';

@Permissions(PERMISSIONS.COMMENTS_VIEW)
@Controller(ADMIN_ROUTES.COMMENTS)
export class CommentsController extends BaseCommentsController {
  constructor(service: CommentsService) {
    super(service);
  }
}
