/**
 * Comments Module barrel export.
 */
export {
  BaseCommentsService,
  BaseCommentsController,
  BaseCommentsModule,
} from './comments.module';

export type { CommentCreateData, CommentUpdateData } from './comments.service';
export type { CommentRowDto } from './comments.service';

export { BaseCommentsAdminService } from './comments-admin.service';
export type {
  CommentRowDto as AdminCommentRowDto,
  ListCommentsParams,
  ListCommentsResult,
} from './comments-admin.service';
