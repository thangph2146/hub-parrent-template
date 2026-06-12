/**
 * Tags Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTagsController } from './tag.controller';

@Module({})
export class BaseTagsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseTagsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseTagsController } from './tag.controller';
export {
  BaseTagsService,
  type TagsRowDto,
  type TagsCreateData,
  type TagsUpdateData,
} from './tag.service';
