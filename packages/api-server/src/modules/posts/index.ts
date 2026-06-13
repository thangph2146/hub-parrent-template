/**
 * Posts module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BasePostsService,
  BasePostsService as BasePostsAdminService,
} from './posts.service';
export {
  BasePostsController,
  BasePostsController as BasePostsAdminController,
} from './posts.controller';
export type { IPostsControllerService } from './posts.controller';
/** @deprecated Dùng `IPostsControllerService`. */
export type { IPostsControllerService as IPostsAdminControllerService } from './posts.controller';
export type {
  PostRowDto,
  PostDetailDto,
  ListPostsParams,
  ListPostsResult,
} from './posts.service';
export { POSTS_FILTER_CATEGORIES_NONE } from './posts.service';
export { BasePostsModule } from './posts.module';
