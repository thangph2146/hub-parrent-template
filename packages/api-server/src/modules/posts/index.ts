/**
 * Posts Module barrel export.
 */
export {
  BasePostsService,
  BasePostsController,
  BasePostsModule,
} from './posts.module';

export type { PostCreateData, PostUpdateData, IPostsService, PostsServiceContract } from './posts.service';
export type { PostRowDto } from './posts.service';

export {
  BasePostsAdminService,
  POSTS_FILTER_CATEGORIES_NONE,
} from './posts-admin.service';
export type {
  PostRowDto as AdminPostRowDto,
  PostDetailDto,
  ListPostsParams,
  ListPostsResult,
} from './posts-admin.service';
export type { IPostsControllerService } from './posts.controller';

export type {
  PostActivityLog,
  PostsModuleConfig,
  PostBulkActionResult,
} from './posts.types';
