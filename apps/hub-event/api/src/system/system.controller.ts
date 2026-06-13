/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseSystemController as PackageSystemController } from '@workspace/api-server/modules/system';
import { AuthService } from '../auth/auth.service';
import { SystemService } from './system.service';

export class SystemController extends PackageSystemController {
  constructor(
    @Inject(SystemService) systemService: SystemService,
    @Inject(AuthService) authService: AuthService,
  ) {
    super(systemService, authService);
  }
}
