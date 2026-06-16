/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * PromoCodes Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePromoCodesController } from './promo-code.controller';

@Module({})
export class BasePromoCodesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BasePromoCodesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BasePromoCodesController } from './promo-code.controller';
export {
  BasePromoCodesService,
  type PromoCodesRowDto,
  type PromoCodesCreateData,
  type PromoCodesUpdateData,
} from './promo-code.service';
