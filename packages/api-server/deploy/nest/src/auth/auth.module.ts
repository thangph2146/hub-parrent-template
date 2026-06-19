import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PublicAuthController } from './public-auth.controller';
import { AuthService } from './auth.service';

/**
 * Auth module — admin login (CMS). Public auth nằm ở `public/*` nếu có.
 */
@Module({
  imports: [],
  controllers: [AuthController, PublicAuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
