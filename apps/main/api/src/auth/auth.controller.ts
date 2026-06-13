import { Inject } from '@nestjs/common';
import { BaseAuthController } from '@workspace/api-server/modules/auth';
import { AuthService } from './auth.service';

export class AuthController extends BaseAuthController {
  constructor(@Inject(AuthService) authService: AuthService) {
    super(authService);
  }
}
