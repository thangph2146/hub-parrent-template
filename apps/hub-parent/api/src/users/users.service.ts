/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';
import { BaseUsersService } from '../common/module-bases/users/users.service';
import type {
  UserRowDto,
  ListUsersParams,
  PaginatedResult,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
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
}
