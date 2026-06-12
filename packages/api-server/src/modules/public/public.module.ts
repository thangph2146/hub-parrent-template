import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePublicController } from './public.controller';

@Module({})
export class BasePublicModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePublicController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePublicController } from './public.controller';
export {
  BasePublicService,
  type PublicPaginationMeta,
  type PublicPagedPayload,
  type RegisterForEventResult,
  type MyRegisteredEventItem,
  type SeoMetaPublicDto,
} from './public.service';

