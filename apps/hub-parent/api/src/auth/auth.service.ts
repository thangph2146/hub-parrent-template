/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';
import { BaseAuthService } from '../common/module-bases/auth/auth.service';

export type {
  AuthRolePayload,
  GoogleProfileDto,
  AuthLoginPayload,
  DevLoginOptionDto,
} from '../common/module-bases/auth/auth.service';

export type AuthUserPayload =
  import('../common/module-bases/auth/auth.service').AuthLoginPayload;

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity() {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity() {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
