/**
 * PageContents Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePageContentsController } from './page-content.controller';

@Module({})
export class BasePageContentsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePageContentsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePageContentsController } from './page-content.controller';
export {
  BasePageContentsService,
  type PageContentsRowDto,
  type PageContentsCreateData,
  type PageContentsUpdateData,
} from './page-content.service';
