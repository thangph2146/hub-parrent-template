/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { BaseSessionsService } from '../common/module-bases/sessions/sessions.service';
export type {
  SessionRowDto,
  ListSessionsParams,
  ListSessionsResult,
  AccountWithSessionStatusDto,
  ListAccountsWithSessionStatusParams,
  ListAccountsWithSessionStatusResult,
} from '../common/module-bases/sessions/sessions.service';

@Injectable()
export class SessionsService extends BaseSessionsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getAuthRoleNames() {
    return AUTH_ROLE_NAMES;
  }

  protected getSessionEntity() {
    return Session as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity() {
    return Role as unknown as new () => Record<string, unknown>;
  }
}
