/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Inject, Injectable, Optional } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  BaseAccountsService,
  type UpdateAccountDto,
  type UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';
import { toEntityId } from '../common/entity-id';
import {
  normalizeNumericStudentCode,
  resolveAvatarFolderPath,
  studentCodeFromSchoolEmail,
} from '../common/student-code-resolve';
import {
  resolveStudentCodeForUser,
  upsertStudentCodeForUser,
} from '../common/student-user-binding';

const HANET_PERSON_REGISTER = 'HANET_PERSON_REGISTER';

type HanetPersonRegister = {
  syncUserFaceToHanet(input: {
    userId: string | number;
    email: string;
    name: string;
    avatarUrl: string;
  }): Promise<unknown>;
};

export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(
    private readonly em: EntityManager,
    @Optional()
    @Inject(HANET_PERSON_REGISTER)
    private readonly hanetPersonRegister?: HanetPersonRegister,
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

  protected override async resolveStudentCode(
    userId: string,
    email: string,
  ): Promise<string | null> {
    return resolveStudentCodeForUser(this.em, userId, email);
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

  private async upsertStudentCode(
    userId: string,
    rawCode: string,
    name: string | null,
    email: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    return upsertStudentCodeForUser(
      this.em,
      userId,
      rawCode,
      name,
      email,
    );
  }

  override async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    if (dto.studentCode !== undefined) {
      const user = await this.em.findOne(User, { id: toEntityId(userId) });
      if (!user || user.deletedAt || !user.isActive) {
        return { ok: false, reason: 'not_found' };
      }
      const upsert = await this.upsertStudentCode(
        userId,
        dto.studentCode ?? '',
        dto.name ?? user.name ?? null,
        user.email ?? '',
      );
      if (!upsert.ok) {
        return { ok: false, reason: 'invalid_student_code' };
      }
    }

    const result = await super.updateProfile(userId, dto);
    if (!result.ok || dto.avatar === undefined) {
      return result;
    }

    const avatar = result.profile.avatar?.trim();
    if (!avatar) {
      return result;
    }

    void this.hanetPersonRegister?.syncUserFaceToHanet({
      userId: result.profile.id,
      email: result.profile.email,
      name: result.profile.name?.trim() || result.profile.email,
      avatarUrl: avatar,
    });

    return result;
  }
}
