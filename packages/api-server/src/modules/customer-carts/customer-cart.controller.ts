/**
 * CustomerCarts Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  CustomerCartsRowDto,
  CustomerCartsCreateData,
  CustomerCartsUpdateData,
} from './customer-cart.service';

export type ICustomerCartsControllerService = ICrudControllerService<
  CustomerCartsRowDto,
  CustomerCartsCreateData,
  CustomerCartsUpdateData
>;

@ApiTags('CustomerCarts')
export class BaseCustomerCartsController extends BaseCrudController<
  CustomerCartsRowDto,
  CustomerCartsCreateData,
  CustomerCartsUpdateData
> {
  constructor(service: ICustomerCartsControllerService) {
    super(service, 'customer-carts');
  }
}
