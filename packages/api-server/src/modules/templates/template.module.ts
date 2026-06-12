/**
 * Templates Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTemplatesController } from './template.controller';

@Module({})
export class BaseTemplatesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseTemplatesController],
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
