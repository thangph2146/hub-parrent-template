/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseCommentsController as PackageCommentsController } from '@workspace/api-server/modules/comments';
import { CommentsService } from './comments.service';

export class CommentsController extends PackageCommentsController {
  constructor(@Inject(CommentsService) commentsService: CommentsService) {
    super(commentsService);
  }
}
