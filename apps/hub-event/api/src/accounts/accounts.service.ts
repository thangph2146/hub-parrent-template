/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseAccountsService } from '@workspace/api-server/modules/accounts';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '@workspace/api-server/modules/accounts';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }
}
