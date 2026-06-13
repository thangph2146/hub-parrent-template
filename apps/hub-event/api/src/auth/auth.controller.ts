/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseAuthController as PackageAuthController } from '@workspace/api-server/modules/auth';
import { AuthService } from './auth.service';

export class AuthController extends PackageAuthController {
  constructor(@Inject(AuthService) authService: AuthService) {
    super(authService);
  }
}
