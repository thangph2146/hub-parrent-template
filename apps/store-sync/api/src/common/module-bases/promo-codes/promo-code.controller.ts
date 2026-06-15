/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * PromoCodes Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  PromoCodesRowDto,
  PromoCodesCreateData,
  PromoCodesUpdateData,
} from './promo-code.service';

export type IPromoCodesControllerService = ICrudControllerService<
  PromoCodesRowDto,
  PromoCodesCreateData,
  PromoCodesUpdateData
>;

@ApiTags('PromoCodes')
export class BasePromoCodesController extends BaseCrudController<
  PromoCodesRowDto,
  PromoCodesCreateData,
  PromoCodesUpdateData
> {
  constructor(service: IPromoCodesControllerService) {
    super(service, 'promo-codes');
  }
}
