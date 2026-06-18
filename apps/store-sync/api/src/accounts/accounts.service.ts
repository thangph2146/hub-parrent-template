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
import { resolveAvatarFolderPath } from '../common/student-code-resolve';

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

  protected override async resolveStudentCode(): Promise<string | null> {
    return null;
  }

  override async resolveAvatarUploadFolder(userId: string): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return { ok: false, message: 'Không tìm thấy tài khoản' };
    }

    return {
      ok: true,
      folderPath: resolveAvatarFolderPath({
        studentCode: profile.studentCode,
        userId: profile.id,
      }),
    };
  }

  override async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    const { studentCode: _studentCode, ...profileDto } = dto;
    return super.updateProfile(userId, profileDto);
  }
}
