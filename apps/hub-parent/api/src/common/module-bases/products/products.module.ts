/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Products Module.
 *
 * Bám sát pattern của `apps/main/api/src/products/products.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseProductsController } from './product.controller';

@Module({})
export class BaseProductsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseProductsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseProductsController } from './product.controller';
export {
  BaseProductsService,
  type ProductRowDto,
  type ProductListParams,
  type ProductListResult,
  type ProductWriteData,
} from './product.service';
