/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';
import { BaseUsersService } from '../common/module-bases/users/users.service';
import { resolveAvatarFolderPath } from '../common/student-code-resolve';
import type {
  UserRowDto,
  ListUsersParams,
  PaginatedResult,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
  UpdateUserData,
} from '../common/module-types';
export type {
  UserRowDto,
  ListUsersParams,
  PaginatedResult,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
};
export type ListUsersResult = PaginatedResult<UserRowDto>;
export type DevLoginOptionDto = DevLoginOption;
export type DevLoginRoleDto = DevLoginRole;

export { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/module-bases/users/users.service';

@Injectable()
export class UsersService extends BaseUsersService {
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

  override async getById(id: string): Promise<UserRowDto | null> {
    const row = await super.getById(id);
    return row ? { ...row, studentCode: null } : null;
  }

  async resolveAvatarUploadFolder(
    userId: string,
  ): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    const row = await this.getById(userId);
    if (!row) {
      return { ok: false, message: 'Không tìm thấy người dùng' };
    }
    return {
      ok: true,
      folderPath: resolveAvatarFolderPath({
        studentCode: row.studentCode,
        userId: row.id,
      }),
    };
  }

  override async update(
    id: string,
    data: UpdateUserData,
    actorEmail?: string | null,
  ): Promise<UserRowDto | null> {
    const { studentCode: _studentCode, ...rest } = data;
    const updated = await super.update(id, rest, actorEmail);
    return updated ? { ...updated, studentCode: null } : null;
  }
}
