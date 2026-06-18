/**
 * Categories Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCategoriesController } from './categories.controller';

@Module({})
export class BaseCategoriesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCategoriesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCategoriesController } from './categories.controller';
export {
  BaseCategoriesService,
  type CategoryRowDto,
  type CategoryCreateData,
  type CategoryUpdateData,
} from './categories.service';
