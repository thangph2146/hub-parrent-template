/**
 * Posts Module barrel export.
 */
export {
  BasePostsService,
  BasePostsController,
  BasePostsModule,
} from './posts.module';

export type { PostRowDto, PostCreateData, PostUpdateData, IPostsService, PostsServiceContract } from './posts.service';
export type { IPostsControllerService } from './posts.controller';

export type {
  PostActivityLog,
  PostsModuleConfig,
  PostBulkActionResult,
} from './posts.types';
