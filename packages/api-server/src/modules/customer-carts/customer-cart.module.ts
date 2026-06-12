/**
 * CustomerCarts Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCustomerCartsController } from './customer-cart.controller';

@Module({})
export class BaseCustomerCartsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCustomerCartsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCustomerCartsController } from './customer-cart.controller';
export {
  BaseCustomerCartsService,
  type CustomerCartsRowDto,
  type CustomerCartsCreateData,
  type CustomerCartsUpdateData,
} from './customer-cart.service';
