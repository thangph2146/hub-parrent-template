/**
 * PostCategories Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePostCategoriesController } from './post-category.controller';

@Module({})
export class BasePostCategoriesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePostCategoriesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePostCategoriesController } from './post-category.controller';
export {
  BasePostCategoriesService,
  type PostCategoriesRowDto,
  type PostCategoriesCreateData,
  type PostCategoriesUpdateData,
} from './post-category.service';
