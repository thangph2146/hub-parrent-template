/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Comment } from '../entities/comment.entity';
import { BaseCommentsService } from '../common/module-bases/comments/comments.service';
export type {
  CommentRowDto,
  ListCommentsParams,
  ListCommentsResult,
} from '../common/module-bases/comments/comments.service';

@Injectable()
export class CommentsService extends BaseCommentsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getCommentEntity() {
    return Comment as unknown as new () => Record<string, unknown>;
  }
}
