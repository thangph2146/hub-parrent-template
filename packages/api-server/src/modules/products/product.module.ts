/**
 * Products Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseProductsController } from './product.controller';

@Module({})
export class BaseProductsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseProductsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseProductsController } from './product.controller';
export {
  BaseProductsService,
  type ProductsRowDto,
  type ProductsCreateData,
  type ProductsUpdateData,
} from './product.service';
