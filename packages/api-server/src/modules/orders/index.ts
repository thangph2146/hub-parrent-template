/**
 * Orders Module barrel export.
 */
export {
  BaseOrdersService,
  BaseOrdersController,
  BaseOrdersModule,
} from './orders.module';

export type { IOrdersControllerService } from './order.controller';

export type {
  OrdersRowDto,
  OrdersCreateData,
  OrdersUpdateData,
} from './order.service';
