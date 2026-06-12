/**
 * Posts Module.
 *
 * NestJS module cho `Post` entity. Subclass có thể:
 *   - Override `forRoot` để thêm imports (vd NotificationsModule)
 *   - Hoặc tạo module mới re-export `BasePostsController`/`BasePostsService`
 *
 * @example
 * ```typescript
 * // Trong app:
 * @Module({
 *   imports: [BasePostsModule, NotificationsModule],
 *   controllers: [PostsController],
 *   providers: [PostsService],
 *   exports: [PostsService],
 * })
 * export class PostsModule {}
 * ```
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePostsController } from './posts.controller';

/**
 * Base Posts Module - cung cấp controller + sẵn sàng cho subclass override.
 */
@Module({})
export class BasePostsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BasePostsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

/**
 * Re-exports.
 */
export { BasePostsController } from './posts.controller';
export {
  BasePostsService,
  type PostRowDto,
  type PostCreateData,
  type PostUpdateData,
  type IPostsService,
  type PostsServiceContract,
} from './posts.service';
