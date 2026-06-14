/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BasePromoCodesController } from '../common/module-bases/promo-codes/promo-code.controller';
import { PromoCodesService } from './promo-codes.service';

@Permissions(PERMISSIONS.PROMO_CODES_VIEW)
@Controller(ADMIN_ROUTES.PROMO_CODES)
export class PromoCodesController extends BasePromoCodesController {
  constructor(service: PromoCodesService) {
    super(service);
  }
}
