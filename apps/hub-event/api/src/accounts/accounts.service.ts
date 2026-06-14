/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { BaseAccountsService } from '../common/module-bases/accounts/accounts.service';
export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }
}
