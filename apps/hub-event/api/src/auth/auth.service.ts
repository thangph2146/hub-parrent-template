/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseAuthService } from '@workspace/api-server/modules/auth';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';

export type {
  AuthLoginPayload,
  GoogleProfileDto,
} from '@workspace/api-server/modules/auth';
export type { AuthLoginPayload as AuthUserPayload } from '@workspace/api-server/modules/auth';

export type LoginDto = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
