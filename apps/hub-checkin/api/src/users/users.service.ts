/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';
import { BaseUsersService } from '../common/module-bases/users/users.service';
import { toEntityId } from '../common/entity-id';
import { resolveAvatarFolderPath } from '../common/student-code-resolve';
import {
  resolveStudentCodeForUser,
  upsertStudentCodeForUser,
} from '../common/student-user-binding';
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
    if (!row) return null;
    const studentCode = await resolveStudentCodeForUser(this.em, id, row.email);
    return { ...row, studentCode };
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
    if (data.studentCode !== undefined) {
      const user = await this.em.findOne(User, { id: toEntityId(id) });
      if (!user || user.deletedAt) {
        return null;
      }
      const upsert = await upsertStudentCodeForUser(
        this.em,
        id,
        data.studentCode ?? '',
        data.name ?? user.name ?? null,
        user.email ?? '',
      );
      if (!upsert.ok) {
        throw new ForbiddenException(upsert.message);
      }
    }

    const { studentCode: _studentCode, ...rest } = data;
    const updated = await super.update(id, rest, actorEmail);
    if (!updated) return null;
    const studentCode = await resolveStudentCodeForUser(
      this.em,
      id,
      updated.email,
    );
    return { ...updated, studentCode };
  }
}
