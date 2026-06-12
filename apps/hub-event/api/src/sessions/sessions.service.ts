/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseSessionsAdminService } from '@workspace/api-server/modules/sessions';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';

export type { SessionRowDto, ListSessionsParams, ListSessionsResult, AccountWithSessionStatusDto, ListAccountsWithSessionStatusParams, ListAccountsWithSessionStatusResult } from '@workspace/api-server/modules/sessions';

@Injectable()
export class SessionsService extends BaseSessionsAdminService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getSessionEntity(): new () => Record<string, unknown> {
    return Session as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity(): new () => Record<string, unknown> {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getAuthRoleNames() {
    return {
      USER: AUTH_ROLE_NAMES.USER,
      ADMIN: AUTH_ROLE_NAMES.ADMIN,
      SUPER_ADMIN: AUTH_ROLE_NAMES.SUPER_ADMIN,
    };
  }
}
