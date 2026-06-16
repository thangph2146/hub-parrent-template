/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  BaseAccountsService,
  type UpdateAccountDto,
  type UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';
import { HanetPersonRegisterService } from '../hanet/hanet-person-register.service';

export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(
    private readonly em: EntityManager,
    private readonly hanetPersonRegister: HanetPersonRegisterService,
  ) {
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

  override async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    const result = await super.updateProfile(userId, dto);
    if (!result.ok || dto.avatar === undefined) {
      return result;
    }

    const avatar = result.profile.avatar?.trim();
    if (!avatar) {
      return result;
    }

    void this.hanetPersonRegister.syncUserFaceToHanet({
      userId: result.profile.id,
      email: result.profile.email,
      name: result.profile.name?.trim() || result.profile.email,
      avatarUrl: avatar,
    });

    return result;
  }
}
