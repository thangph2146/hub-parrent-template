/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthAdminController } from './auth-admin.controller';

@Module({
  controllers: [AuthAdminController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
