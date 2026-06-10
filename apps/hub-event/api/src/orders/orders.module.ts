import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { UploadsModule } from '../uploads/uploads.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';

@Module({
  imports: [ProductsModule, PromoCodesModule, UploadsModule],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
