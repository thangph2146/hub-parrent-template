/**
 * Templates Module.
 *
 * Bám sát pattern của `apps/main/api/src/templates/templates.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTemplatesController } from './template.controller';

@Module({})
export class BaseTemplatesModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseTemplatesController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseTemplatesController } from './template.controller';
export {
  BaseTemplatesService,
  type TemplatesRowDto,
  type TemplatesCreateData,
  type TemplatesUpdateData,
} from './template.service';
