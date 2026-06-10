import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { PublicCartsController } from './public-carts.controller';

@Module({
  controllers: [PublicCartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
