/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PUBLIC_ROUTES } from '../config/constants';
import { BaseCartsController } from '../common/module-bases/carts/carts.controller';
import { CartsService } from './carts.service';

@Controller(`${PUBLIC_ROUTES.BASE}/cart`)
export class PublicCartsController extends BaseCartsController {
  constructor(cartsService: CartsService) {
    super(cartsService);
  }
}
