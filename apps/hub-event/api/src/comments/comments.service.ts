/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseCommentsAdminService } from '@workspace/api-server/modules/comments';
import { Comment } from '../entities/comment.entity';

export type {
  CommentRowDto,
  ListCommentsParams,
  ListCommentsResult,
} from '@workspace/api-server/modules/comments';

@Injectable()
export class CommentsService extends BaseCommentsAdminService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCommentEntity(): new () => Record<string, unknown> {
    return Comment as unknown as new () => Record<string, unknown>;
  }
}
