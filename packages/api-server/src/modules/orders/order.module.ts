/**
 * Orders Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseOrdersController } from './order.controller';

@Module({})
export class BaseOrdersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseOrdersController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseOrdersController } from './order.controller';
export {
  BaseOrdersService,
  type OrdersRowDto,
  type OrdersCreateData,
  type OrdersUpdateData,
} from './order.service';
