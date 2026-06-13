/**
 * Posts Module — NestJS wiring cho admin posts.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePostsController } from './posts.controller';

@Module({})
export class BasePostsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePostsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePostsController } from './posts.controller';
export {
  BasePostsService,
  POSTS_FILTER_CATEGORIES_NONE,
  type PostRowDto,
  type PostDetailDto,
  type ListPostsParams,
  type ListPostsResult,
} from './posts.service';
