import { Module } from '@nestjs/common';
import { AuthController, StorePublicDevLoginOptionsController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Auth module — admin login (CMS). Public auth nằm ở `public/*` nếu có.
 */
@Module({
  imports: [],
  controllers: [AuthController, StorePublicDevLoginOptionsController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
