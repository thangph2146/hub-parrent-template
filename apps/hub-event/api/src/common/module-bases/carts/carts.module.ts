/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Carts Module.
 *
 * Bám sát pattern của `apps/main/api/src/carts/carts.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCartsController } from './carts.controller';

@Module({})
export class BaseCartsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCartsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCartsController } from './carts.controller';
export { BaseCartsService } from './carts.service';