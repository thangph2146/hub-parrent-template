import { Inject } from '@nestjs/common';
import { BaseSystemController } from '@workspace/api-server/modules/system';
import { AuthService } from '../auth/auth.service';
import { SystemService } from './system.service';

export class SystemController extends BaseSystemController {
  constructor(
    @Inject(SystemService) systemService: SystemService,
    @Inject(AuthService) authService: AuthService,
  ) {
    super(systemService, authService);
  }
}
