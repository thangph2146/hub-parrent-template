/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Tags Module.
 *
 * Bám sát pattern của `apps/main/api/src/tags/tags.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTagsController } from './tag.controller';

@Module({})
export class BaseTagsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseTagsController,
      ],
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
