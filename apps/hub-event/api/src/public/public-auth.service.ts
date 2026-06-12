/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicAuthService } from '@workspace/api-server/modules/public';
import { Role } from '../entities/role.entity';
import { Setting } from '../entities/setting.entity';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

export type { CreatePublicRegisterDto } from '@workspace/api-server/modules/public';

@Injectable()
export class PublicAuthService extends BasePublicAuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUsersService() {
    return this.usersService;
  }

  protected getAuthService() {
    return this.authService;
  }
}
