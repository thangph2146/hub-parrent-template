/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Controller } from '@nestjs/common';
import { PUBLIC_ROUTES } from '../config/constants';
import { BasePublicAuthController } from '../common/module-bases/auth/public-auth.controller';
import { AuthService } from './auth.service';

@Controller(PUBLIC_ROUTES.BASE)
export class PublicAuthController extends BasePublicAuthController {
  constructor(service: AuthService) {
    super(service);
  }
}
