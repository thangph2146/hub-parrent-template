/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * PageContents Module — NestJS wiring cho admin page-contents.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePageContentsController } from './page-contents.controller';

@Module({})
export class BasePageContentsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BasePageContentsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePageContentsController } from './page-contents.controller';
export {
  BasePageContentsService,
  type PageContentCreateInput,
  type PageContentUpdateInput,
} from './page-contents.service';
