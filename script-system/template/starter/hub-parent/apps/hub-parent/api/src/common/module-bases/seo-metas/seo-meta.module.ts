/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * SeoMetas Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSeoMetasController } from './seo-meta.controller';

@Module({})
export class BaseSeoMetasModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseSeoMetasController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseSeoMetasController } from './seo-meta.controller';
export {
  BaseSeoMetasService,
  type SeoMetasRowDto,
  type SeoMetasCreateData,
  type SeoMetasUpdateData,
} from './seo-meta.service';
