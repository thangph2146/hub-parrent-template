/**
 * PostTags Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePostTagsController } from './post-tag.controller';

@Module({})
export class BasePostTagsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePostTagsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePostTagsController } from './post-tag.controller';
export {
  BasePostTagsService,
  type PostTagsRowDto,
  type PostTagsCreateData,
  type PostTagsUpdateData,
} from './post-tag.service';
