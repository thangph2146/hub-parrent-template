/**
 * Orders Module.
 *
 * Bám sát pattern của `apps/main/api/src/orders/orders.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseOrdersController } from './order.controller';

@Module({})
export class BaseOrdersModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseOrdersController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseOrdersController } from './order.controller';
export {
  BaseOrdersService,
  type OrderRowDto,
  type CreateOrderDto,
  type OrderStatus,
  type StaffOrderStatusCounts,
} from './order.service';
