/**
 * Comments module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseCommentsService,
  BaseCommentsService as BaseCommentsAdminService,
} from './comments.service';
export {
  BaseCommentsController,
  BaseCommentsController as BaseCommentsAdminController,
} from './comments.controller';
export type { ICommentsControllerService } from './comments.controller';
/** @deprecated Dùng `ICommentsControllerService`. */
export type { ICommentsControllerService as ICommentsAdminControllerService } from './comments.controller';
export type {
  ListCommentsParams,
  ListCommentsResult,
} from './comments.service';
export type { CommentRowDto, CommentRowDto as AdminCommentRowDto } from './comments.service';
export { BaseCommentsModule } from './comments.module';
