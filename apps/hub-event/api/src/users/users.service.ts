/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseUsersService } from '@workspace/api-server/modules/users';
import {
  canEditProtectedAdminUser,
  isProtectedAdminEmail,
} from '../config/protected-admin';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';

export type {
  DevLoginOptionDto,
  DevLoginOptionsQuery,
} from '../common/dev-login-options';

@Injectable()
export class UsersService extends BaseUsersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): unknown {
    return User;
  }

  protected getRoleEntity(): unknown {
    return Role;
  }

  protected getUserRoleEntity(): unknown {
    return UserRole;
  }

  protected getSettingEntity(): unknown {
    return Setting;
  }

  protected canEditProtectedAdminUser(
    actorEmail: string,
    targetEmail: string,
  ): boolean {
    return canEditProtectedAdminUser(actorEmail, targetEmail);
  }

  protected isProtectedAdminEmail(email: string): boolean {
    return isProtectedAdminEmail(email);
  }
}
