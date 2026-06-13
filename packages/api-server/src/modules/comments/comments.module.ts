/**
 * Comments Module — NestJS wiring cho admin comments.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCommentsController } from './comments.controller';

@Module({})
export class BaseCommentsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCommentsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCommentsController } from './comments.controller';
export {
  BaseCommentsService,
  type CommentRowDto,
  type ListCommentsParams,
  type ListCommentsResult,
} from './comments.service';
